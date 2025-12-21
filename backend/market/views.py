from rest_framework import viewsets, permissions
from .models import Order, Trade
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # This automatically attaches the logged-in React user to the order
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Allow filtering by product via URL, e.g., /api/orders/?product=1
        queryset = Order.objects.all()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset