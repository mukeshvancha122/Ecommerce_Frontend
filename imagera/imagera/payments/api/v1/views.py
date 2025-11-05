from typing import Any
from django.db.models.query import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,

)
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
import stripe
from django.conf import settings
from imagera.orders.models import CustomerCouponUsed, Orders
from imagera.payments.api.v1.serializers import (
    CardInformationSerializer,
    OrderPaymentSerializer,
)


class OrderPaymentConfirmation(CreateAPIView):
    serializer_class = OrderPaymentSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    @extend_schema(
        operation_id="Payment Gateway",
        description="""
            methods value are: esewa, khalti or cod
        """,
    )
    def post(self, request, *args, **kwargs):
        price = (
            Orders.objects.filter(
                order_by=request.user,
                order_status__iexact="Pending",
                order_confirmed=False,
            )
            .first()
            .order_price
        )
        serializer = self.serializer_class(
            data=request.data, context={"request": request, "price": price}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Order payment confirmed successfully"},
            status=status.HTTP_201_CREATED,
        )


class StripePaymentAPI(APIView):
    serializer_class = CardInformationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        order = Orders.objects.filter(
            order_by=request.user,
            order_status__iexact="Pending",
            order_confirmed=False,
        ).first()
        if order.coupon:
            CustomerCouponUsed.objects.create(
                user=self.context["request"].user, coupon_code=order.coupon
            )
        if order.coins_used:
            try:
                user_profile = self.context["request"].user.users_rewards
                user_profile.diamond_coins -= order.coins_used
                user_profile.save()
            except:
                return Response(
                    {"detail": "Not enough coin!"}, status=status.HTTP_204_NO_CONTENT
                )

        response = {}
        if serializer.is_valid():
            data_dict = serializer.data
            stripe.api_key = settings.STRIPE_SECRET_KEY
            response = self.stripe_card_payment(data_dict=data_dict, order=order)

        else:
            response = {
                "errors": serializer.errors,
                "status": status.HTTP_400_BAD_REQUEST,
            }

        return Response(response)

    def stripe_card_payment(self, data_dict, order):
        try:
            card_details = stripe.PaymentMethod.create(
                type="card",
                card={
                    "number": data_dict["card_number"],
                    "exp_month": data_dict["expiry_month"],
                    "exp_year": data_dict["expiry_year"],
                    "cvc": data_dict["cvc"],
                },
            )

            payment_intent = stripe.PaymentIntent.create(
                amount=order.price,
                currency="npr",
                metadata={"order_code": order.order_code},
            )
            payment_intent_modified = stripe.PaymentIntent.modify(
                payment_intent["id"],
                payment_method=card_details["id"],
            )
            try:
                payment_confirm = stripe.PaymentIntent.confirm(payment_intent["id"])
                payment_intent_modified = stripe.PaymentIntent.retrieve(
                    payment_intent["id"]
                )
            except:
                payment_intent_modified = stripe.PaymentIntent.retrieve(
                    payment_intent["id"]
                )
                payment_confirm = {
                    "stripe_payment_error": "Failed",
                    "code": payment_intent_modified["last_payment_error"]["code"],
                    "message": payment_intent_modified["last_payment_error"]["message"],
                    "status": "Failed",
                }
            if (
                payment_intent_modified
                and payment_intent_modified["status"] == "succeeded"
            ):
                orders = CardInformationSerializer.create_checkout(
                    order=order, price=order.price
                )
                response = {
                    "message": "Card Payment Success",
                    "status": status.HTTP_200_OK,
                    "card_details": card_details,
                    "payment_intent": payment_intent_modified,
                    "payment_confirm": payment_confirm,
                }
            else:
                response = {
                    "message": "Card Payment Failed",
                    "status": status.HTTP_400_BAD_REQUEST,
                    "card_details": card_details,
                    "payment_intent": payment_intent_modified,
                    "payment_confirm": payment_confirm,
                }
        except:
            response = {
                "error": "Your card number is incorrect",
                "status": status.HTTP_400_BAD_REQUEST,
                "payment_intent": {"id": "Null"},
                "payment_confirm": {"status": "Failed"},
            }
        return response
