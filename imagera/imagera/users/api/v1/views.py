from django.utils.translation import gettext_lazy as _
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework.throttling import ScopedRateThrottle
from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
)
from rest_framework import status, serializers
from rest_framework.generics import (
    CreateAPIView,
    UpdateAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from imagera.users.api.v1.serializers import (
    # FacebookAuthSerializer,
    ForgetPasswordResetEmailSerializer,
    ForgetPasswordSerializer,
    # GoogleAuthSerializer,
    JWTTokenSerializer,
    UpdatePasswordSerializer,
    UpgradeBusinessUserSerializer,
    UserCreateSerializer,
    UserObjectSerializer,
    UserVerifySerializer,
    VerifyBusinessAccountSerializer,
)
from imagera.users.models import BusinessAccount, User


sensitive_post_parameters_m = method_decorator(
    sensitive_post_parameters(
        "password", "old_password", "re_password", "new_password1", "new_password2"
    )
)


class RegisterUser(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserCreateSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "user_register"

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": _("User Created!")},
            status=status.HTTP_201_CREATED,
        )


class VerifyUserEmail(APIView):
    permission_classes = []
    serializer_class = UserVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return Response({"data": data}, status=status.HTTP_200_OK)


class GetJWTToken(APIView):
    permission_classes = []
    serializer_class = JWTTokenSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "user_jwt_token"

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_response = serializer.generate_token(serializer.validated_data)
        return Response({"data": user_response}, status=status.HTTP_200_OK)


class UpdateDestroyUser(RetrieveUpdateDestroyAPIView):
    serializer_class = UserObjectSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    queryset = User.objects.all()
    lookup_field = "pk"

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if "user_image" in serializer.validated_data and instance.user_image:
            instance.user_image.delete(save=False)
        self.perform_update(serializer)
        return Response({"detail": "Updated!"}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user_image:
            instance.user_image.delete(save=False)
        self.perform_destroy(instance)
        return Response({"detail": "User has been deleted!"}, status=status.HTTP_200_OK)


class UpdateUserPassword(UpdateAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = UpdatePasswordSerializer

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.update(user, serializer.validated_data)
        return Response(
            {"detail": "Password updated successfully."}, status=status.HTTP_200_OK
        )


class CreateBusinessAccount(RetrieveUpdateAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = UpgradeBusinessUserSerializer
    queryset = BusinessAccount.objects.all()

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        users = BusinessAccount.objects.get(client=request.user)
        serializer = UpgradeBusinessUserSerializer(users, many=False)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.update(user, serializer.validated_data)
        return Response(
            {"detail": "Upgrade to Business User Request Generated."},
            status=status.HTTP_200_OK,
        )


class AdminVerifyBusinessAccount(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]
    serializer_class = VerifyBusinessAccountSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "User Upgraded to Business Account"}, status=status.HTTP_200_OK
        )

    def get(self, request, *args, **kwargs):
        users = BusinessAccount.objects.filter(business_verified=False)
        serializer = VerifyBusinessAccountSerializer(users, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class ForgetPasswordResetEmail(APIView):
    permission_classes = []
    serializer_class = ForgetPasswordResetEmailSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "user_password_reset"

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.send_email(serializer.data)
        return Response({"detail": "Otp has been sent!"}, status=status.HTTP_200_OK)


class VerifyForgetPasswordOTP(APIView):
    permission_classes = []
    serializer_class = ForgetPasswordResetEmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return Response({"data": data}, status=status.HTTP_200_OK)


class ForgetPassword(APIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = ForgetPasswordSerializer

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password has been updated!"}, status=status.HTTP_200_OK
        )


# class GoogleAuthView(CreateAPIView):
#     serializer_class = GoogleAuthSerializer
#     permission_classes = []
#     throttle_classes = (ScopedRateThrottle,)
#     throttle_scope = "google_registration"

#     @extend_schema(
#         operation_id="Google Social Auth Registration API ",
#         request=GoogleAuthSerializer,
#         responses=inline_serializer(
#             "google_token_response",
#             fields={
#                 "refresh": serializers.CharField(),
#                 "access": serializers.CharField(),
#                 "personal_info_added": serializers.BooleanField(),
#             },
#         ),
#     )
#     def post(self, request):
#         serializer = self.serializer_class(
#             data=request.data, context={"request": request}
#         )
#         serializer.is_valid(raise_exception=True)
#         return Response(serializer.validated_data, status=status.HTTP_200_OK)


# class FacebookAuthView(CreateAPIView):
#     serializer_class = FacebookAuthSerializer
#     permission_classes = ()
#     throttle_classes = (ScopedRateThrottle,)
#     throttle_scope = "facebook_registration"

#     @extend_schema(
#         operation_id="Facebook Auth Account Creation API ",
#         request=FacebookAuthSerializer,
#         responses=inline_serializer(
#             "facebook_token_response",
#             fields={
#                 "refresh": serializers.CharField(),
#                 "access": serializers.CharField(),
#                 "personal_info_added": serializers.BooleanField(),
#             },
#         ),
#     )
#     def post(self, request):
#         """
#         POST with "auth_token"
#         Send an access token as from facebook to get user information
#         """

#         serializer = self.serializer_class(
#             data=request.data, context={"request": request}
#         )
#         serializer.is_valid(raise_exception=True)
#         data = (serializer.validated_data)["auth_token"]
#         return Response(data, status=status.HTTP_200_OK)
