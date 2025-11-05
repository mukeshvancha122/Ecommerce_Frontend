from django.urls import path
from rest_framework.routers import DefaultRouter

from imagera.payments.api.v1.views import OrderPaymentConfirmation, StripePaymentAPI


app_name = "payment"

router = DefaultRouter()


urlpatterns = [
    path(
        "order-payment/",
        OrderPaymentConfirmation.as_view(),
        name="order_payment",
    ),
    path(
        "stripe-payment/",
        StripePaymentAPI.as_view(),
        name="stripe_payment",
    ),
]


urlpatterns += router.urls