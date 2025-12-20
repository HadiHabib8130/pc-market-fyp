from rest_framework import serializers
from .models import Order, Trade
from products.models import Product

class OrderSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = Order
        fields = ['id', 'username', 'product', 'product_name', 'order_type', 'price', 'status', 'created_at']
        read_only_fields = ['user', 'status'] # User is set automatically in the view