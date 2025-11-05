from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
    ListCreateAPIView,
    RetrieveDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from imagera.product.api.v1.admin.serializers import (
    BrandSerializer,
    CategorySerializer,
    ComboProductSerializer,
    CreateBestSellingProductSerializer,
    CreateExcitingProductSerializer,
    CreateFeaturedProductSerializer,
    CreateHandpickedProductSerializer,
    CreateTopSellingProductSerializer,
    CreateWeeklyDropProductSerializer,
    ProductAdminReplySerializer,
    ProductCommentReplySerializer,
    ProductTagsSerializer,
    ProductsSerializer,
    RemoveBestSellingProductSerializer,
    RemoveExcitingProductSerializer,
    RemoveFeaturedProductSerializer,
    RemoveHandpickedProductSerializer,
    RemoveTopSellingProductSerializer,
    RemoveWeeklyDropProductSerializer,
    SubCategorySerializer,
)
from imagera.product.models import (
    BrandDetails,
    BusinessProductDetails,
    Category,
    ComboDiscount,
    LaptopProduct,
    ProductComment,
    ProductImage,
    ProductTags,
    ProductVariations,
    Products,
    SubCategory,
)


class CreateProduct(ListCreateAPIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]
    serializer_class = ProductsSerializer
    queryset = Products.objects.all()
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"data": "Product Created!"}, status=status.HTTP_201_CREATED)


class UpdateDeleteProduct(RetrieveUpdateDestroyAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = ProductsSerializer
    queryset = Products.objects.all()
    lookup_field = "pk"

    def perform_destroy(self, instance):
        # Delete associated ProductVariations
        for variation in ProductVariations.objects.filter(product=instance):
            variation.product_images.clear()
            variation.delete()

        # Delete associated LaptopProduct if exists
        LaptopProduct.objects.filter(laptop=instance).delete()
        BusinessProductDetails.objects.filter(product=instance).delete()

        # Delete the product instance
        instance.delete()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Update or create associated LaptopProduct if provided in request
        laptop_data = request.data.get("laptop_product")
        if laptop_data:
            laptop_product, created = LaptopProduct.objects.update_or_create(
                laptop=instance, defaults=laptop_data
            )
        business_product_data = request.data.get("business_product")
        if business_product_data:
            business_product, _ = BusinessProductDetails.objects.update_or_create(
                product=instance, defaults=business_product_data
            )
        # Update or create associated ProductVariations if provided in request
        variations_data = request.data.get("product_variations")
        if variations_data:
            for variation_data in variations_data:
                variation_id = variation_data.get("id")
                if variation_id:
                    variation_instance = ProductVariations.objects.get(id=variation_id)
                    for attr, value in variation_data.items():
                        setattr(variation_instance, attr, value)
                    variation_instance.save()
                else:
                    ProductVariations.objects.create(product=instance, **variation_data)
        if "product_images" in request.data:
            images_data = request.data.pop("uploaded_images")
            # Clear existing images
            instance.product_variations.get(id=variations_data["id"]).update(
                product_images=None
            )
            # Add new images
            for variation_data in images_data:
                if "id" in variations_data:
                    variation = ProductVariations.objects.get(id=variations_data["id"])
                    variation.product_images.clear()
                    for img in images_data:
                        image = ProductImage.objects.create(img)
                        variation.product_images.add(image)
                    variation.save()
        return Response(serializer.data)


class CreateCategory(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Category has been created!"}, status=status.HTTP_201_CREATED
        )


class CreateBrand(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = BrandSerializer
    queryset = BrandDetails.objects.all()
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Brand has been created!"}, status=status.HTTP_201_CREATED
        )


class UpdateBrand(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = BrandSerializer
    queryset = BrandDetails.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"detail": "Updated!"}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Brand has been deleted!"}, status=status.HTTP_200_OK
        )


class UpdateCategory(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"detail": "Updated!"}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Category has been deleted!"}, status=status.HTTP_200_OK
        )


class CreateSubCategory(CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = SubCategorySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Sub Category has been created!"}, status=status.HTTP_201_CREATED
        )


class ListViewSubCategory(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = SubCategorySerializer
    lookup_field = "id"
    pagination_class = PageNumberPagination

    def get(self, request, *args, **kwargs):
        category_id = self.kwargs.get("id")
        sub_Category_data = SubCategory.objects.filter(category_id=category_id)
        serializer = self.serializer_class(sub_Category_data, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class UpdateSubCategory(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = SubCategorySerializer
    queryset = SubCategory.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"detail": "Updated!"}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Sub Category has been deleted!"}, status=status.HTTP_200_OK
        )



class CreateComboProductDiscount(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ComboProductSerializer
    queryset = ComboDiscount.objects.all()
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Combo Product has been created!"},
            status=status.HTTP_201_CREATED,
        )


class DestroyComboProductDiscount(RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ComboProductSerializer
    queryset = ComboDiscount.objects.all()
    lookup_field = "pk"

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Combo Product has been deleted!"}, status=status.HTTP_200_OK
        )


class ProductCommentReplyView(ListCreateAPIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]
    pagination_class = PageNumberPagination
    serializer_class = ProductAdminReplySerializer
    queryset = ProductComment.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Query Replied!"}, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = ProductCommentReplySerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class CreateTopSellingProducts(ListCreateAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination
    serializer_class = CreateTopSellingProductSerializer
    queryset = Products.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Top Selling Products Created!"}, status=status.HTTP_201_CREATED
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(is_top_selling=True)
        serializer = ProductsSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class RemoveTopSellingProducts(APIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = RemoveTopSellingProductSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Top Selling Products Removed!"}, status=status.HTTP_200_OK
        )


class CreateBestSellerProducts(ListCreateAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination
    serializer_class = CreateBestSellingProductSerializer
    queryset = Products.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Best Seller Products Created!"}, status=status.HTTP_201_CREATED
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(best_seller=True)
        serializer = ProductsSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class RemoveBestSellingProducts(APIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = RemoveBestSellingProductSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Best Selling Products Removed!"}, status=status.HTTP_200_OK
        )


class CreateHandpickedProducts(ListCreateAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination
    serializer_class = CreateHandpickedProductSerializer
    queryset = Products.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Handpicked Products Created!"}, status=status.HTTP_201_CREATED
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(handpicked=True)
        serializer = ProductsSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class RemoveHandpickedProducts(APIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = RemoveHandpickedProductSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Handpicked Products Removed!"}, status=status.HTTP_200_OK
        )

class CreateFeaturedProducts(ListCreateAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination
    serializer_class = CreateFeaturedProductSerializer
    queryset = Products.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Featured Products Created!"}, status=status.HTTP_201_CREATED
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(featured_product=True)
        serializer = ProductsSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class RemoveFeaturedProducts(APIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = RemoveFeaturedProductSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Featured Products Removed!"}, status=status.HTTP_200_OK
        )

class CreateExcitingDealsProducts(ListCreateAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination
    serializer_class = CreateExcitingProductSerializer
    queryset = Products.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Exciting Products Created!"}, status=status.HTTP_201_CREATED
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(exciting_deals=True)
        serializer = ProductsSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class RemoveExcitingProducts(APIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = RemoveExcitingProductSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Exciting Products Removed!"}, status=status.HTTP_200_OK
        )

class CreateWeeklyDropProducts(ListCreateAPIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    pagination_class = PageNumberPagination
    serializer_class = CreateWeeklyDropProductSerializer
    queryset = Products.objects.all().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Weekly Drop Products Created!"}, status=status.HTTP_201_CREATED
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(weekly_drop=True)
        serializer = ProductsSerializer(queryset, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class RemoveWeeklyDropProducts(APIView):
    permission_classes = [
        IsAdminUser,
        IsAuthenticated,
    ]
    serializer_class = RemoveWeeklyDropProductSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Weekly Drop Products Removed!"}, status=status.HTTP_200_OK
        )

class CreateProductTag(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ProductTagsSerializer
    queryset = ProductTags.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Tag has been created!"}, status=status.HTTP_201_CREATED
        )


class UpdateDeleteTags(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ProductTagsSerializer
    queryset = ProductTags.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"detail": "Updated!"}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Tag has been deleted!"}, status=status.HTTP_200_OK
        )