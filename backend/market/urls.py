from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet # Ensure this import is active!

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    # This automatically creates endpoints like /api/orders/
    path('', include(router.urls)),
]