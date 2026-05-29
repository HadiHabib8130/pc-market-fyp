from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreateBuyOrderView, 
    OrderViewSet, 
    SingleBuyOrderDetailView, 
    SingleListingDetailView,
    BuyerBuyOrderListView,
    BuyerBuyOrderDetailView
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    # This automatically creates endpoints like /api/orders/
    path('', include(router.urls)),
    path('place-order/', CreateBuyOrderView.as_view(), name='place-order'),
    path('listing/<int:pk>/', SingleListingDetailView.as_view(), name='single-listing'),
    path('bid/<int:pk>/', SingleBuyOrderDetailView.as_view(), name='single-bid'),
    path('bids/my-bids/', BuyerBuyOrderListView.as_view(), name='buyer-my-bids'),
    path('bids/<int:pk>/', BuyerBuyOrderDetailView.as_view(), name='buyer-bid-detail'),
]