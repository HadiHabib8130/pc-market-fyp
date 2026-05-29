from rest_framework import viewsets, permissions
from .models import Order, match_order, BuyOrder
from .serializers import OrderSerializer, BuyOrderSerializer, ProductListingDetailSerializer, BuyOrderDetailSerializer
# Fix: Ensure this points to products.models
from products.models import MasterProduct, ProductListing 
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        match_order(order)


class CreateBuyOrderView(generics.CreateAPIView):
    # 1. Base configuration
    queryset = BuyOrder.objects.all()
    serializer_class = BuyOrderSerializer
    
    # 2. PRIMARY SECURITY: Reject anyone without a valid JWT token
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        # 3. SECONDARY SECURITY: Ensure only 'buyers' can place bids
        if self.request.user.role != 'buyer':
            raise PermissionDenied("Access Denied: Only registered buyers can place orders on the exchange.")
        
        # 4. Save the row and automatically attach the logged-in user!
        serializer.save(buyer=self.request.user)

class SingleListingDetailView(generics.RetrieveAPIView):
    """Fetches full details, images, and seller info for a single listing."""
    queryset = ProductListing.objects.filter(is_active=True)
    serializer_class = ProductListingDetailSerializer
    permission_classes = [AllowAny]

class SingleBuyOrderDetailView(generics.RetrieveAPIView):
    """Fetches full details and buyer info for a specific active bid."""
    # We only want to show bids that are still 'pending'
    queryset = BuyOrder.objects.filter(status='pending')
    serializer_class = BuyOrderDetailSerializer
    permission_classes = [AllowAny]


class BuyerBuyOrderListView(generics.ListAPIView):
    """
    Lists only the active/all buy orders placed by the currently logged-in buyer.
    """
    serializer_class = BuyOrderDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BuyOrder.objects.filter(buyer=self.request.user).order_by('-created_at')


class BuyerBuyOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Allows a logged-in buyer to retrieve, update (edit price/condition), or cancel (delete) their own bid.
    """
    serializer_class = BuyOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Enforces that a buyer can ONLY access/update/delete their own buy orders!
        return BuyOrder.objects.filter(buyer=self.request.user)