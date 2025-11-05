from django.db import models
from imagera.core.models import TimeStampAbstractModel
from imagera.users.models import User
from django.utils import timezone
from django.db.models import Avg, Count
from django.contrib.postgres.search import SearchVectorField, SearchVector
from django.contrib.postgres.indexes import GinIndex
from django.utils.text import slugify


class Category(models.Model):
    category_name = models.CharField(max_length=150, null=True)
    category_discount = models.PositiveIntegerField(default=0)
    discount_start_date = models.DateTimeField(null=True, blank=True)
    discount_end_date = models.DateTimeField(null=True, blank=True)
    category_image = models.ImageField(upload_to="category/", null=True, blank=True)
    slug = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.category_name

    def is_discount_active(self):
        now = timezone.now()
        try:
            return (self.discount_start_date <= now) and (self.discount_end_date >= now)
        except:
            return False

    def save(self, *args, **kwargs):
        if not self.slug or slugify(self.category_name) != self.slug:
            base_slug = slugify(self.category_name)
            slug = base_slug
            num = 1
            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super(self.__class__, self).save(*args, **kwargs)


class SubCategory(models.Model):
    sub_category_name = models.CharField(max_length=150, null=True)
    sub_category_discount = models.PositiveIntegerField(default=0)
    discount_start_date = models.DateTimeField(null=True, blank=True)
    discount_end_date = models.DateTimeField(null=True, blank=True)
    sub_category_image = models.ImageField(
        upload_to="sub_category/", null=True, blank=True
    )
    category = models.ForeignKey(
        Category, null=True, on_delete=models.SET_NULL, related_name="sub_category"
    )
    slug = models.CharField(max_length=255, null=True, blank=True)
    parent_sub_category = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sub_categories",
    )

    def __str__(self):
        return self.sub_category_name

    def is_discount_active(self):
        now = timezone.now()
        try:
            return (self.discount_start_date <= now) and (self.discount_end_date >= now)
        except:
            return False

    def save(self, *args, **kwargs):
        if not self.slug or slugify(self.sub_category_name) != self.slug:
            base_slug = slugify(self.sub_category_name)
            slug = base_slug
            num = 1
            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super(self.__class__, self).save(*args, **kwargs)


class ProductImage(models.Model):
    product_image = models.ImageField(upload_to="product/")

    def __str__(self):
        return self.product_image.url


class BrandDetails(models.Model):
    slug = models.CharField(max_length=255, null=True, blank=True)
    brand_name = models.CharField(max_length=255, null=True, blank=True)
    brand_image = models.ImageField(upload_to="brand/", null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug or slugify(self.brand_name) != self.slug:
            base_slug = slugify(self.brand_name)
            slug = base_slug
            num = 1
            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super(self.__class__, self).save(*args, **kwargs)


class ProductTags(models.Model):
    product_tag = models.CharField(max_length=255, null=True, blank=True)


class Products(TimeStampAbstractModel):
    product_name = models.CharField(max_length=150)
    product_description = models.TextField(null=True, blank=True)
    product_discount = models.PositiveIntegerField(default=0)
    product_category = models.ForeignKey(Category, null=True, on_delete=models.SET_NULL)
    product_category_name = models.CharField(max_length=255, null=True, blank=True)
    sub_category = models.ForeignKey(SubCategory, null=True, on_delete=models.SET_NULL)
    sub_category_name = models.CharField(max_length=255, null=True, blank=True)
    brand = models.ForeignKey(
        BrandDetails,
        related_name="products_brand",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    brand_name = models.CharField(max_length=255, null=True, blank=True)
    is_top_selling = models.BooleanField(default=False)
    weekly_drop = models.BooleanField(default=False)
    excitingdeal_start_date = models.DateTimeField(null=True, blank=True)
    excitingdeal_end_date = models.DateTimeField(null=True, blank=True)
    featured_product = models.BooleanField(default=False)
    handpicked = models.BooleanField(default=False)
    faq = models.TextField(null=True, blank=True)
    age_restriction = models.BooleanField(default=False)
    search_vector = SearchVectorField(null=True)
    free_delivery = models.BooleanField(default=False)
    best_seller = models.BooleanField(default=False)
    tag = models.ForeignKey(
        ProductTags,
        related_name="products_tag",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    has_cashback = models.BooleanField(default=False)
    slug = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        indexes = [
            GinIndex(fields=["search_vector"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug or slugify(self.product_name) != self.slug:
            base_slug = slugify(self.product_name)
            slug = base_slug
            num = 1
            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug

        self.product_category_name = (
            self.product_category.category_name if self.product_category else ""
        )
        self.sub_category_name = (
            self.sub_category.sub_category_name if self.sub_category else ""
        )
        self.brand_name = self.brand.brand_name if self.brand else ""
        super(self.__class__, self).save(*args, **kwargs)
        self.update_search_vector()

    def update_search_vector(self):
        search_vector = (
            SearchVector("product_name", weight="A")
            + SearchVector("product_category_name", weight="B")
            + SearchVector("sub_category_name", weight="B")
            + SearchVector("brand_name", weight="C")
        )
        Products.objects.filter(pk=self.pk).update(search_vector=search_vector)

    def __str__(self):
        return self.product_name

    def get_rating_info(self):
        rating_info = self.product_rating.aggregate(
            average_rating=Avg("rating"), total_ratings=Count("rating")
        )
        return rating_info

    @property
    def exciting_deals(self):
        now = timezone.now()
        try:
            return (self.excitingdeal_start_date <= now) and (
                self.excitingdeal_end_date >= now
            )
        except:
            return False


class ProductVariations(models.Model):
    product = models.ForeignKey(
        Products, on_delete=models.CASCADE, related_name="product_variations"
    )
    product_color = models.CharField(max_length=255, null=True, blank=True)
    product_size = models.CharField(max_length=255, null=True, blank=True)
    product_price = models.PositiveIntegerField()
    product_images = models.ManyToManyField(ProductImage, blank=True)
    product_quantity = models.PositiveIntegerField()
    product_weight = models.DecimalField(
        max_digits=10, decimal_places=3, null=True, blank=True
    )
    slug = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.product_color} ({self.product_size}) ({self.product_quantity})"

    def get_discounted_price(self):
        base_price = self.product_price
        discounted_price = base_price

        discount = self.product.product_discount
        # Step 1: Calculate product discount
        product_discount = self.product.product_discount
        product_discount_amount = (
            product_discount * 0.01 * base_price if product_discount else 0
        )

        # Step 2: Calculate subcategory discount based on the discounted price from step 1
        sub_category = self.product.sub_category
        sub_category_discount_amount = 0
        if (
            sub_category
            and sub_category.is_discount_active()
            and product_discount_amount != 0
        ):
            sub_category_discount = self._get_total_subcategory_discount(sub_category)
            sub_category_discount_amount = (
                sub_category_discount * 0.01 * (product_discount_amount)
            )
            discount += discount * sub_category_discount * 0.01
            product_discount_amount += sub_category_discount_amount
        elif (
            sub_category
            and sub_category.is_discount_active()
            and product_discount_amount == 0
        ):
            sub_category_discount = self._get_total_subcategory_discount(sub_category)
            sub_category_discount_amount = sub_category_discount * 0.01 * (base_price)
            discount += sub_category_discount
            product_discount_amount += sub_category_discount_amount

        category = self.product.product_category
        category_discount_amount = 0
        if category and category.is_discount_active() and product_discount_amount != 0:
            category_discount = category.category_discount
            category_discount_amount = (
                category_discount * 0.01 * (product_discount_amount)
            )
            product_discount_amount += category_discount_amount
            discount += discount * category_discount * 0.01
        elif (
            category and category.is_discount_active() and product_discount_amount == 0
        ):
            category_discount = category.category_discount
            category_discount_amount = (
                category_discount * 0.01 * (product_discount_amount)
            )
            product_discount_amount += category_discount_amount
            discount += category_discount

        # Step 4: Subtract the total discount amount from the base price
        discounted_price -= product_discount_amount
        discounted_price = max(0, discounted_price)
        response = {
            "final_price": discounted_price,
            "discount_amount": product_discount_amount,
            "active_discount_percentage": discount,
        }

        return response

    def _get_total_subcategory_discount(self, sub_category):
        total_discount_percent = 0
        while sub_category:
            if sub_category.is_discount_active():
                subcategory_discount = sub_category.sub_category_discount
                if total_discount_percent != 0:
                    parent_discount_percent = subcategory_discount * (
                        total_discount_percent / 100
                    )
                else:
                    parent_discount_percent = subcategory_discount
                total_discount_percent += parent_discount_percent
            sub_category = sub_category.parent_sub_category
        return total_discount_percent

    def get_image_count(self):
        return self.product_images.count()

    def save(self, *args, **kwargs):
        if not self.slug or slugify(self.product.product_name) != self.slug:
            base_slug = slugify(self.product.product_name)
            slug = base_slug
            num = 1
            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super(self.__class__, self).save(*args, **kwargs)


class LaptopProduct(models.Model):
    laptop = models.OneToOneField(
        ProductVariations, on_delete=models.CASCADE, related_name="laptop_product"
    )
    laptop_processor = models.CharField(max_length=50, null=True, blank=True)
    ram = models.CharField(max_length=50, null=True, blank=True)
    ssd = models.CharField(max_length=50, null=True, blank=True)
    hard_disk = models.CharField(max_length=50, null=True, blank=True)
    graphics_card = models.CharField(max_length=50, null=True, blank=True)
    screen_size = models.CharField(max_length=50, null=True, blank=True)
    battery_life = models.CharField(max_length=50, null=True, blank=True)
    weight = models.CharField(max_length=50, null=True, blank=True)
    operating_system = models.CharField(max_length=50, null=True, blank=True)
    others = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Laptop Specifications for {self.laptop.product.product_name}"


class ExtraAtrributeFields(models.Model):
    variation = models.ForeignKey(
        ProductVariations,
        on_delete=models.CASCADE,
        related_name="product_extra_attribute",
    )
    attribute_name = models.CharField(max_length=255)
    attribute_value = models.CharField(max_length=255)


class BusinessProductDetails(models.Model):
    product = models.OneToOneField(
        Products, on_delete=models.CASCADE, related_name="business_product"
    )
    minimum_bulk_quantity = models.PositiveIntegerField(default=0)
    business_discount = models.PositiveIntegerField(default=0)


class ComboDiscount(models.Model):
    combo_discount_name = models.CharField(max_length=255, null=True, blank=True)
    products = models.ManyToManyField(Products, related_name="combo_discounts")
    discount_percentage = models.PositiveIntegerField(default=0)
    slug = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        product_names = ", ".join(
            [product.product_name for product in self.products.all()]
        )
        return f"Combo Discount for {product_names}"

    def is_satisfied(self, cart_items):
        combo_product_ids = set(self.products.values_list("id", flat=True))
        cart_product_ids = set(cart_items.values_list("item__product__id", flat=True))
        return combo_product_ids.issubset(cart_product_ids)

    def save(self, *args, **kwargs):
        if not self.slug or slugify(self.combo_discount_name) != self.slug:
            base_slug = slugify(self.combo_discount_name)
            slug = base_slug
            num = 1
            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super(self.__class__, self).save(*args, **kwargs)


class WishItem(models.Model):
    item = models.ForeignKey(
        Products, on_delete=models.CASCADE, related_name="wished_product"
    )


class Wishlist(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_wishlist"
    )
    products = models.ManyToManyField(WishItem)

    def __str__(self):
        return f"Wishlist of {self.user.email}"


class SearchedProduct(TimeStampAbstractModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_seearched_data"
    )
    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name="searched_products",
        null=True,
        blank=True,
    )
    searched_term = models.CharField(max_length=255, null=True, blank=True)


class ProductReviewRating(models.Model):
    product = models.ForeignKey(
        Products, on_delete=models.CASCADE, related_name="product_rating"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_ratings"
    )
    review = models.TextField(max_length=500, blank=True, null=True)
    top_review = models.BooleanField(default=False)
    rating = models.FloatField(blank=True, null=True)


class ReviewImages(models.Model):
    review = models.ForeignKey(
        ProductReviewRating, on_delete=models.CASCADE, related_name="review_images"
    )
    image = models.ImageField(upload_to="review_images/", blank=True, null=True)


class RemovedFromCart(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_removed_cart"
    )
    product = models.ForeignKey(
        Products, on_delete=models.CASCADE, related_name="product_removed_cart"
    )


class ProductComment(models.Model):
    product = models.ForeignKey(
        Products, on_delete=models.CASCADE, related_name="comments"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_answered = models.BooleanField(default=False)

    def __str__(self):
        return f"Comment by {self.user.name} on {self.product.product_name}"


class CommentReply(models.Model):
    comment = models.ForeignKey(
        ProductComment, on_delete=models.CASCADE, related_name="replies"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.user.name} on {self.comment}"
