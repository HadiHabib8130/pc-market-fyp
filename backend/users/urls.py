from django.urls import path
from . import views
from .views import (
    BuyerRegistrationView, 
    CustomTokenObtainPairView, 
    CurrentBuyerProfileView,
    MyAccountInfoView
)

urlpatterns = [
    # Seller Endpoints (Left 100% untouched)
    path('register-seller/', views.register_seller, name='register-seller'),
    path('seller-login/', views.SellerTokenObtainPairView.as_view(), name='seller-login'),
    
    # Clean & Secure Buyer Endpoints
    path('register/', BuyerRegistrationView.as_view(), name='buyer-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='buyer-login'),
    path('me/', CurrentBuyerProfileView.as_view(), name='buyer-me'),

    path('account/me/', MyAccountInfoView.as_view(), name='my-account-info'),
]