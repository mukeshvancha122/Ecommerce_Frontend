from django.urls import path
from rest_framework.routers import DefaultRouter
from imagera.orders.api.v1.views import (
    AddShipingAddress,
    CancelOrder,
    CartView,
    CashBackApply,
    CreateOrderView,
    CurrentOrderView,
    DistrictChoicesAPIView,
    MunicipalityChoicesAPIView,
    OrderFindView,
    ReduceItemQuantityView,
    RemoveFromCartView,
    RetrieveOrderHistory,
    ReturnProdutsView,
    TrackOrderView,
    UpdateOrderView,
)

app_name = "orders"

router = DefaultRouter()

urlpatterns = [
    path(
        "cart/",
        CartView.as_view(),
        name="cart",
    ),
    path(
        "cart/remove/",
        RemoveFromCartView.as_view(),
        name="remove_from_cart",
    ),
    path(
        "cart/reduce/",
        ReduceItemQuantityView.as_view(),
        name="reduce_item_quantity",
    ),
    path(
        "shipping-address/",
        AddShipingAddress.as_view(),
        name="shipping_address",
    ),
    path(
        "start-checkout/",
        CreateOrderView.as_view(),
        name="start_checkout",
    ),
    path(
        "update-checkout/",
        UpdateOrderView.as_view(),
        name="update_checkout",
    ),
    path(
        "order-history/",
        RetrieveOrderHistory.as_view(),
        name="order_history",
    ),
    path(
        "current-order/",
        CurrentOrderView.as_view(),
        name="current_order",
    ),
    path(
        "track-order/<str:order_code>/<str:email>/",
        TrackOrderView.as_view(),
        name="track_order",
    ),
    path(
        "district-choices/",
        DistrictChoicesAPIView.as_view(),
        name="district_choices",
    ),
    path(
        "municipality-choices/",
        MunicipalityChoicesAPIView.as_view(),
        name="municipality_choices",
    ),
    path(
        "return-product/",
        ReturnProdutsView.as_view(),
        name="return_product",
    ),
    path(
        "find-order/<str:ordercode>/",
        OrderFindView.as_view(),
        name="order_find",
    ),
    path(
        "cancel-order/<str:id>/",
        CancelOrder.as_view(),
        name="cancel_order",
    ),
    path(
        "payment-gateway/<str:method>/",
        CashBackApply.as_view(),
        name="cashback_apply",
    ),
]

urlpatterns += router.urls
