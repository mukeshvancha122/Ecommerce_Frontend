from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from imagera.users.api.v1.views import (
    AdminVerifyBusinessAccount,
    CreateBusinessAccount,
    # FacebookAuthView,
    ForgetPassword,
    ForgetPasswordResetEmail,
    # GoogleAuthView,
    RegisterUser,
    UpdateUserPassword,
    VerifyForgetPasswordOTP,
    VerifyUserEmail,
    GetJWTToken,
    UpdateDestroyUser,
)

app_name = "user"

router = DefaultRouter()

urlpatterns = [
    path("register/", RegisterUser.as_view(), name="create_user"),
    path("verify-user/", VerifyUserEmail.as_view(), name="verify_user"),
    path("get-token/", GetJWTToken.as_view(), name="user_login"),
    path(
        "update-destory-user/", UpdateDestroyUser.as_view(), name="update_delete_user"
    ),
    path("update-password/", UpdateUserPassword.as_view(), name="update_password"),
    path("upgrade-business/", CreateBusinessAccount.as_view(), name="busness_account"),
    path(
        "verify-business/",
        AdminVerifyBusinessAccount.as_view(),
        name="admin_verify_business",
    ),
    path("refresh-token/", TokenRefreshView.as_view(), name="refresh_token"),
    path(
        "password-reset-email/",
        ForgetPasswordResetEmail.as_view(),
        name="reset_password_email",
    ),
    path(
        "password-reset-verify/",
        VerifyForgetPasswordOTP.as_view(),
        name="reset_password_otp_verify",
    ),
    path("reset_password/", ForgetPassword.as_view(), name="reset_password"),
    # path(
    #     "google/account/",
    #     GoogleAuthView.as_view(),
    #     name="google_oauth_registration",
    # ),
    # path(
    #     "facebook/account/",
    #     FacebookAuthView.as_view(),
    #     name="facebook_account_registration",
    # ),
]

urlpatterns += router.urls
