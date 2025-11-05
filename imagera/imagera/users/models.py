from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from datetime import date
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Default custom user model for mountemart.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    class UserType(models.IntegerChoices):
        CUSTOMER = 1, _("Customer")
        ADMIN = 2, _("Admin")
        STAFF = 3, _("Staff")
        BUSINESS = 4, _("Business")

    SOCIAL_AUTH_PROVIDERS = (
        ("GOOGLE", ("GOOGLE")),
        ("FACEBOOK", ("FACEBOOK")),
    )
    selections = [("Male", "Male"), ("Female", "Female"), ("Others", "Others")]
    email = models.EmailField(_("Email Address"), unique=True)
    name = models.CharField("Name", max_length=150, null=True)
    social_auth = models.CharField(
        choices=SOCIAL_AUTH_PROVIDERS,
        max_length=100,
        blank=True,
        null=True,
        help_text="This field indicates through which social app has user logged in or signup",
    )
    user_image = models.ImageField(upload_to="user_profile", blank=True)
    phone = models.PositiveBigIntegerField("Phone Number", unique=True, null=True)
    gender = models.CharField(
        "Gender", max_length=20, choices=selections, default="Male", null=True
    )
    address = models.CharField("Address", max_length=80, null=True)
    user_type = models.IntegerField(choices=UserType.choices, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    dob = models.DateField(null=True, blank=True)
    email_verified = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def staff(self):
        "Is the user a member of staff?"
        return self.is_staff

    @property
    def admin(self):
        "Is the user a admin member?"
        return True if self.user_type == 2 else False

    @property
    def customer(self):
        "Is the user a customer member?"
        return True if self.user_type == 1 else False

    @property
    def business(self):
        "Is the user a business member?"
        return True if self.user_type == 4 else False

    def get_gender(self):
        if not self.gender:
            return "Male"
        else:
            return self.gender

    def get_image(self):
        if not self.user_image:
            return "/media/user_image/user.jpg"
        else:
            return self.user_image

    def age(self):
        today = date.today()
        age = (
            today.year
            - self.dob.year
            - ((today.month, today.day) < (self.dob.month, self.dob.day))
        )
        return age


class BusinessAccount(models.Model):
    client = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField("Business Name", max_length=80, null=True)
    business_certificate = models.FileField(upload_to="business")
    client_identity = models.FileField(upload_to="identity", blank=True)
    business_number = models.CharField("Phone Number", max_length=15, null=True)
    business_verified = models.BooleanField(default=False)
