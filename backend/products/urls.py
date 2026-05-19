# backend/products/urls.py
from django.urls import path
from .views import MasterProductSearchView, ProductListingCreateView, ProductListingListView, MasterProductListView, MarketTradingRoomView
urlpatterns = [
    # Right: /api/products/master-search/
    # Wrong: /api/products/api/products/master-search/
    path('master-search/', MasterProductSearchView.as_view(), name='master-search'),
    path('listings/', ProductListingListView.as_view(), name='listing-list'),
    path('listings/create/', ProductListingCreateView.as_view(), name='listing-create'),
    path('master-list/', MasterProductListView.as_view(), name='master-list'),
    path('market/<int:pk>/', MarketTradingRoomView.as_view(), name='market-trading-room'),
    #path('buyer/register/', BuyerRegistrationView.as_view(), name='buyer-register'),
]