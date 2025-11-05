from rest_framework import serializers
from django.utils import timezone
from imagera.orders.models import ForbiddenDelivery
from imagera.product.models import (
    BrandDetails,
    BusinessProductDetails,
    Category,
    ComboDiscount,
    CommentReply,
    ExtraAtrributeFields,
    LaptopProduct,
    ProductComment,
    ProductTags,
    ProductVariations,
    Products,
    ProductImage,
    SubCategory,
)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "product_image"]


class LaptopProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaptopProduct
        fields = [
            "laptop_processor",
            "ram",
            "ssd",
            "hard_disk",
            "graphics_card",
            "screen_size",
            "battery_life",
            "weight",
            "operating_system",
            "others",
        ]


class ProductTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTags
        fields = ["id", "product_tag"]


class ExtraAtrributeFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraAtrributeFields
        fields = [
            "id",
            "attribute_name",
            "attribute_value",
        ]


class ProductVariationsSerializer(serializers.ModelSerializer):
    product_images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(write_only=True, required=False),
        write_only=True,
        required=False,
    )
    laptop_product = LaptopProductSerializer(required=False)
    extra_attributes = ExtraAtrributeFieldSerializer(
        many=True, required=False, write_only=True
    )

    class Meta:
        model = ProductVariations
        fields = [
            "id",
            "product_color",
            "product_size",
            "product_quantity",
            "product_weight",
            "product_price",
            "product_images",
            "uploaded_images",
            "get_image_count",
            "laptop_product",
            "get_discounted_price",
            "extra_attributes",
        ]
        read_only_fields = ["get_image_count", "slug"]

    def create(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        extra_attr = validated_data.pop("extra_attributes", [])
        product_variation = super().create(**validated_data, product=instance)

        # Create extra attributes
        for attr in extra_attr:
            ExtraAtrributeFields.objects.create(
                product_variation=product_variation, **attr
            )

        # Create uploaded images
        for image in uploaded_images:
            ProductImage.objects.create(
                product_image=image, product_variations=product_variation
            )

        return product_variation

    def update_extra_attr(self, instance, data):
        extra_attr = data.get("extra_attributes", [])
        instance = super().update(instance, extra_attr)

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])

        # Update instance
        instance = super().update(instance, validated_data)

        # Clear existing images and create new ones
        instance.product_images.clear()
        for image in uploaded_images:
            ProductImage.objects.create(
                product_image=image, product_variations=instance
            )

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Recreate the product variations with the new context
        representation["extra_attributes"] = ExtraAtrributeFieldSerializer(
            instance.product_extra_attribute.all(), many=True, context=self.context
        ).data

        return representation


class BusinessProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProductDetails
        fields = [
            "minimum_bulk_quantity",
            "business_discount",
        ]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandDetails
        fields = ["id", "brand_name", "brand_image"]
        read_only_fields = ["slug"]


class ProductsSerializer(serializers.ModelSerializer):
    product_variations = ProductVariationsSerializer(many=True)
    business_product = BusinessProductSerializer(required=False)
    forbidden_delivery = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True, required=False
    )
    product_tags = ProductTagsSerializer(read_only=True)
    product_images = serializers.CharField(max_length=255, read_only=True)
    class Meta:
        model = Products
        fields = [
            "id",
            "product_name",
            "product_description",
            "product_discount",
            "product_category",
            "sub_category",
            "is_top_selling",
            "weekly_drop",
            "exciting_deals",
            "featured_product",
            "faq",
            "brand",
            "age_restriction",
            "product_variations",
            "business_product",
            "forbidden_delivery",
            "handpicked",
            "best_seller",
            "free_delivery",
            "has_cashback",
            "product_tags",
            "tag",
            "excitingdeal_start_date",
            "excitingdeal_end_date",
            "product_images",
        ]
        read_only_fields = ["slug", "product_images"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Recreate the product variations with the new context
        representation["product_variations"] = ProductVariationsSerializer(
            instance.product_variations.all(), many=True, context=self.context
        ).data

        return representation

    def update_forbidden_delivery(self, product, forbidden_delivery_data):
        # Clear existing forbidden deliveries
        ForbiddenDelivery.objects.filter(product=product).delete()

        # Create new forbidden deliveries
        for district in forbidden_delivery_data:
            ForbiddenDelivery.objects.create(product=product, district=district)

    def update(self, instance, validated_data):
        product_variations_data = validated_data.pop("product_variations", [])
        forbidden_delivery_data = validated_data.pop("forbidden_delivery", [])
        instance = super().update(instance, validated_data)

        for variation_data in product_variations_data:
            variation_id = variation_data.get("id")
            if variation_id:
                extra_attr = variation_data.pop("extra_attributes", [])
                variation_instance = ProductVariations.objects.get(
                    id=variation_id, product=instance
                )
                ProductVariationsSerializer().update(variation_instance, variation_data)
                for attr in extra_attr:
                    extra_attr_id = attr.get("id")
                    if extra_attr_id:
                        extra_attr_instance = ExtraAtrributeFields.objects.get(
                            id=extra_attr_id, variation=variation_instance
                        )
                        ProductVariationsSerializer().update_extra_attr(
                            extra_attr_instance, attr
                        )
                    else:
                        ExtraAtrributeFields.objects.create(
                            variation=variation_instance, **attr
                        )
            else:
                ProductVariationsSerializer().create(
                    validated_data=variation_data, instance=instance
                )

        self.update_forbidden_delivery(instance, forbidden_delivery_data)

        return instance

    def create(self, validated_data):
        product_variations_data = validated_data.pop("product_variations")
        forbidden_delivery_data = validated_data.pop("forbidden_delivery", [])
        business_product_data = validated_data.pop("business_product", None)

        product = Products.objects.create(**validated_data)

        for variation_data in product_variations_data:
            extra_attr = variation_data.pop("extra_attributes", [])
            variation = ProductVariations.objects.create(
                product=product, **variation_data
            )
            # Create extra attributes
            for attr in extra_attr:
                ExtraAtrributeFields.objects.create(variation=variation, **attr)

            images = variation_data.pop("uploaded_images", [])
            for img in images:
                variation.product_images.add(img)
            variation.save()

        if business_product_data:
            BusinessProductDetails.objects.create(
                product=product, **business_product_data
            )
        self.update_forbidden_delivery(product, forbidden_delivery_data)

        return product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["slug"]

    def create(self, validated_data):
        category = Category.objects.create(**validated_data)
        return category


class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

    def to_internal_value(self, data):
        serializer = self.parent.parent.__class__(data=data, context=self.context)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data


class SubCategorySerializer(serializers.ModelSerializer):
    category_id = serializers.CharField(max_length=255, write_only=True)
    sub_categories = RecursiveField(many=True, read_only=True)
    parent_sub_category_id = serializers.CharField(
        max_length=255, write_only=True, required=False
    )

    class Meta:
        model = SubCategory
        fields = [
            "id",
            "sub_category_name",
            "sub_category_discount",
            "discount_start_date",
            "discount_end_date",
            "sub_category_image",
            "sub_categories",
            "category_id",
            "parent_sub_category_id",
        ]
        read_only_fields = ["category", "slug"]

    def create(self, validated_data):
        category = validated_data.pop("category_id")
        sub_categories_data = validated_data.pop("parent_sub_category_id", None)
        sub_category = SubCategory.objects.create(
            **validated_data, category_id=category
        )

        if sub_categories_data:
            sub_categorys = SubCategory.objects.get(id=sub_categories_data)
            sub_category.parent_sub_category = sub_categorys
            sub_category.save()
        return sub_category


class ComboProductSerializer(serializers.ModelSerializer):
    product_details = serializers.ListField(
        child=serializers.CharField(write_only=True, required=True, max_length=250),
        write_only=True,
        required=True,
    )
    products = ProductsSerializer(many=True, read_only=True)

    class Meta:
        model = ComboDiscount
        fields = [
            "id",
            "product_details",
            "products",
            "discount_percentage",
            "combo_discount_name",
        ]
        read_only_fields = ["slug"]

    def create(self, validated_data):
        product_ids = validated_data["product_details"]
        combo = ComboDiscount.objects.create(
            discount_percentage=validated_data["discount_percentage"],
            combo_discount_name=validated_data["combo_discount_name"],
        )
        for product in product_ids:
            combo.products.add(product)
            combo.save()
        return combo


class ProductAdminReplySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    comment_id = serializers.CharField(max_length=255, write_only=True)

    class Meta:
        model = CommentReply
        fields = ["content", "comment_id", "username"]

    def create(self, validated_data):
        reply = CommentReply.objects.create(
            comment_id=validated_data["comment_id"],
            user=self.context["request"].user,
            content=validated_data["content"],
        )
        return validated_data

    def get_username(self, obj):
        return obj.user.name


class ProductCommentReplySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField("get_username")
    reply = serializers.SerializerMethodField("get_replies")

    class Meta:
        model = ProductComment
        fields = ["id", "content", "is_answered", "username", "reply"]

    def get_username(self, obj):
        return obj.user.name

    def get_replies(self, obj):
        reply = CommentReply.objects.filter(comment_id=obj.id)
        serializer = ProductAdminReplySerializer(reply, many=True)
        return serializer.data


class CreateTopSellingProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.is_top_selling = True
            product.save()
        return validated_data


class RemoveTopSellingProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.is_top_selling = False
            product.save()
        return validated_data


class CreateBestSellingProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.best_seller = True
            product.save()
        return validated_data


class RemoveBestSellingProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.best_seller = False
            product.save()
        return validated_data


class CreateHandpickedProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.handpicked = True
            product.save()
        return validated_data


class RemoveHandpickedProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.handpicked = False
            product.save()
        return validated_data


class CreateFeaturedProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.featured_product = True
            product.save()
        return validated_data


class RemoveFeaturedProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.featured_product = False
            product.save()
        return validated_data


class CreateExcitingProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )
    start_date=serializers.DateTimeField()
    end_date=serializers.DateTimeField()

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.excitingdeal_start_date=validated_data["start_date"]
            product.excitingdeal_end_date=validated_data["end_date"]
            product.save()
        return validated_data


class RemoveExcitingProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.exciting_deals = False
            product.save()
        return validated_data


class CreateWeeklyDropProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.weekly_drop = True
            product.save()
        return validated_data


class RemoveWeeklyDropProductSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(max_length=255), write_only=True
    )

    def create(self, validated_data):
        products = Products.objects.filter(id__in=validated_data["product_ids"])
        for product in products:
            product.weekly_drop = False
            product.save()
        return validated_data
