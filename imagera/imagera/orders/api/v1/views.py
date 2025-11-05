from typing import Any
from django.db.models.query import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    UpdateAPIView,
    ListCreateAPIView,
    DestroyAPIView,
)
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from imagera.core.pagination import DynamicPageNumberPagination
from imagera.orders.api.v1.serializers import (
    AddCartItemsSerializer,
    CartItemsSerializer,
    ConfirmedOrderSerializer,
    CreateOrderSerializer,
    DistrictSerializer,
    DropLocationSerializer,
    OrderSerializer,
    ReduceItemQuantitySerializer,
    ReturnProductSerializer,
    UpdateOrderSerializer,
)
from imagera.orders.models import (
    DropLocation,
    Items,
    Orders,
    ReturnProductRequest,
)
from imagera.product.models import ComboDiscount, RemovedFromCart
from django.db.models import Q
from nepali_municipalities import NepalMunicipality


class CartView(ListCreateAPIView):
    serializer_class = AddCartItemsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Items.objects.filter(user=self.request.user, current_order=False)

    @extend_schema(
        operation_id="Add To cart API",
        description="""
            Allows to add product variation to cart.
            Please Provide Variations ID for Item Id.
        """,
    )
    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = AddCartItemsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items_data = serializer.validated_data["items"]

        for item_data in items_data:
            item_id = item_data["item_id"]
            quantity = item_data["quantity"]

            item, created = Items.objects.get_or_create(
                user=user,
                item_id=item_id,
                current_order=False,
                defaults={"quantity": quantity},
            )
            if not created:
                item.quantity += quantity
                item.save()

        return Response(
            {"detail": "Product Added to cart!"}, status=status.HTTP_201_CREATED
        )

    def get_combo_discounts(self, queryset):
        combo_discounts_applied = []
        combo_discount_amount = 0

        combo_discounts = ComboDiscount.objects.filter(
            products__product_variations__in=[item.item for item in queryset]
        ).distinct()

        for combo_discount in combo_discounts:
            combo_product_ids = set(
                combo_discount.products.values_list("id", flat=True)
            )
            cart_product_ids = set(queryset.values_list("item__product__id", flat=True))

            if combo_product_ids.issubset(cart_product_ids):
                discount_percentage = combo_discount.discount_percentage
                for item in queryset:
                    if item.item.product.id in combo_product_ids:
                        discounted_price = (
                            1 - discount_percentage * 0.01
                        ) * item.get_discounted_price()
                        combo_discount_amount += (
                            item.get_discounted_price() - discounted_price
                        ) * item.quantity
                        combo_discounts_applied.append(
                            {
                                "combo": combo_discount,
                                "product": item.item.product,
                                "discounted_price": discounted_price,
                                "quantity": item.quantity,
                            }
                        )

        return combo_discount_amount, combo_discounts_applied

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        total_price = 0
        total_discount = 0
        total_amount = 0
        combo_discount_amount, combo_discounts_applied = self.get_combo_discounts(
            queryset
        )

        combo_product_ids = set(item["product"].id for item in combo_discounts_applied)

        for item in queryset:
            if item.item.product.id not in combo_product_ids:
                product_discounted_price = item.item.get_discounted_price()[
                    "discount_amount"
                ]
                item_total = item.quantity * product_discounted_price

                total_price += (
                    item.quantity * item.item.get_discounted_price()["final_price"]
                )
                total_amount += item_total
            else:
                total_price += (
                    item.quantity * item.item.get_discounted_price()["final_price"]
                )

        total_amount += combo_discount_amount
        total_discount = total_amount
        final_price = total_price - combo_discount_amount

        serializer = CartItemsSerializer(queryset, many=True)
        response = {
            "data": serializer.data,
            "summary": {
                "total_price": total_price,
                "total_discount_amount": total_discount,
                "total_combo_discount_amount": combo_discount_amount,
                "final_total_price": final_price,
            },
            "combo_discounts_applied": [
                {
                    "combo": discount["combo"].id,
                    "product": discount["product"].id,
                    "discounted_price": discount["discounted_price"],
                    "quantity": discount["quantity"],
                }
                for discount in combo_discounts_applied
            ],
        }
        return Response(response, status=status.HTTP_200_OK)


class RemoveFromCartView(DestroyAPIView):
    serializer_class = CartItemsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Items.objects.filter(user=self.request.user, current_order=False)

    def delete(self, request, *args, **kwargs):
        item_id = request.data.get("item_id")
        item = self.get_queryset().filter(item_id=item_id).first()
        if item:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)


class ReduceItemQuantityView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReduceItemQuantitySerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        item_id = serializer.validated_data["item_id"]
        quantity = serializer.validated_data["quantity"]

        try:
            cart_item = Items.objects.get(
                user=user, item_id=item_id, current_order=False
            )
            if cart_item.quantity > quantity:
                cart_item.quantity -= quantity
                cart_item.save()
                return Response(
                    {"message": "Item quantity reduced successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                RemovedFromCart.objects.get_or_create(
                    user=request.user, product=cart_item.item.product
                )
                cart_item.delete()
                return Response(
                    {
                        "message": "Item removed from cart as quantity became zero or negative."
                    },
                    status=status.HTTP_200_OK,
                )
        except Items.DoesNotExist:
            return Response(
                {"message": "Item not found in cart."}, status=status.HTTP_404_NOT_FOUND
            )


class AddShipingAddress(ListCreateAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = DropLocationSerializer

    def get_queryset(self):
        return DropLocation.objects.filter(user=self.request.user)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Shipping address added successfully."},
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class CreateOrderView(ListCreateAPIView):
    serializer_class = CreateOrderSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Order Started!"}, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        orders = Orders.objects.filter(
            order_by=request.user, order_status__iexact="Pending"
        )
        serializer = OrderSerializer(orders, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class UpdateOrderView(CreateAPIView):
    serializer_class = UpdateOrderSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Order Updated!"}, status=status.HTTP_201_CREATED)


class RetrieveOrderHistory(ListAPIView):
    serializer_class = ConfirmedOrderSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Orders.objects.filter(
            order_by=self.request.user,
            order_status__iexact="Delivered",
            order_confirmed=True,
        ).order_by("-order_date")
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class CurrentOrderView(ListAPIView):
    serializer_class = ConfirmedOrderSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = (
            Orders.objects.filter(
                order_by=self.request.user,
                order_confirmed=True,
            )
            .filter(
                Q(order_status__iexact="Processing") | Q(order_status__iexact="Shipped")
            )
            .order_by("-order_date")
        )
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class TrackOrderView(APIView):
    serializer_class = ConfirmedOrderSerializer
    permission_classes = []

    def get(self, request, *args, **kwargs):
        ordercode = kwargs.get("order_code")
        email = kwargs.get("email")

        queryset = Orders.objects.get(
            order_code=ordercode, drop_location__email__iexact=email
        )
        serializer = self.serializer_class(queryset, many=False)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)



class DistrictChoicesAPIView(ListAPIView):

    def get(self, request, *args, **kwargs):
        try:
            all_districts = NepalMunicipality().all_districts()
            serializer = DistrictSerializer({"district_choices": all_districts})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MunicipalityChoicesAPIView(ListAPIView):

    @extend_schema(
        operation_id="Municipalities List",
        description="""
            Allows to Search Municipalities
        """,
        parameters=[
            OpenApiParameter(
                name="district",
                required=True,
                type=str,
                description="District name",
            ),
        ],
    )
    def get(self, request, *args, **kwargs):
        district = request.query_params.get("district")
        try:
            all_data = NepalMunicipality(district).all_municipalities()
            serializer = DistrictSerializer({"municipalities_choices": all_data})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReturnProdutsView(ListCreateAPIView):
    serializer_class = ReturnProductSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Product return request generated successfully"},
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, *args, **kwargs):
        queryset = ReturnProductRequest.objects.filter(user=request.user)
        serializer = ReturnProductSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class OrderFindView(ListAPIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request, *args, **kwargs):
        ordercode = kwargs.get("ordercode")
        queryset = Orders.objects.filter(
            order_code=ordercode, order_by=self.request.user
        )
        serializer = OrderSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class CancelOrder(CreateAPIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, *args, **kwargs):
        order_id = kwargs.get("id")
        try:
            order = Orders.objects.get(
                Q(order_status__iexact="Processing")
                | Q(order_status__iexact="Shipped"),
                id=order_id,
                order_by=self.request.user,
            )
        except Orders.DoesNotExist:
            return Response(
                {"message": "Order cannot be cancelled!"},
                status=status.HTTP_404_NOT_FOUND,
            )
        order.order_status = "Cancelled"
        order.save()
        return Response(
            {"message": "Order cancelled successfully"}, status=status.HTTP_200_OK
        )


class CashBackApply(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    @extend_schema(
        operation_id="Cashback",
        description="""
            methods value are: esewa, khalti, stripe or cod
        """,
    )
    def post(self, request, *args, **kwargs):
        method = kwargs.get("method")
        order = Orders.objects.filter(
            order_by=self.request.user,
            order_status="Pending",
        ).first()
        cashback = False
        for item in order.item.all():
            if item.item.product.has_cashback:
                cashback = True

        if method == "khalti" or method == "esewa" or method == "stripe":
            if order.cashback_applied:
                return Response(
                    {"message": "Cashback already applied for this order!"},
                    status=status.HTTP_200_OK,
                )
            else:
                if order.order_price >= 100:
                    order.order_price -= 5
                    order.cashback_applied = True
                    order.save()
                else:
                    return Response(
                        {"message": "Cashback can't be applied for this order!"},
                        status=status.HTTP_200_OK,
                    )
        else:
            if order.cashback_applied:
                order.order_price += 5
                order.cashback_applied = False
                order.save()
                return Response(
                    {"message": "Cashback removed!"}, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"message": "Cashback not applied for this order!"},
                    status=status.HTTP_200_OK,
                )
