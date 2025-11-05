from django.contrib import admin
from imagera.users.forms import UserChangeForm, UserCreationForm
from .models import User
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Define admin model for custom User model with no email field."""

    form = UserChangeForm
    add_form = UserCreationForm
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                    "social_auth",
                    "email_verified",
                )
            },
        ),
        (
            _("Personal info"),
            {"fields": ("name", "phone", "user_image", "gender", "address", "dob")},
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "dob",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )
    list_display = ["email", "name", "is_superuser"]
    search_fields = ["name", "email"]
    ordering = ["email"]
    readonly_fields = ["social_auth"]


# Register your models here.
