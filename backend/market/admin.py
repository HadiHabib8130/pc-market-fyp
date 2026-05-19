from django.contrib import admin
from .models import Order, Trade, BuyOrder

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'order_type', 'price', 'status', 'created_at']
    list_filter = ['order_type', 'status', 'product']

@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ['product', 'buyer', 'seller', 'price', 'timestamp']
    readonly_fields = ['timestamp']

@admin.register(BuyOrder)
class BuyOrderAdmin(admin.ModelAdmin):
    # This dictates which columns show up on the admin dashboard
    list_display = ['id', 'buyer', 'master_product', 'bid_price', 'condition', 'requires_warranty', 'status', 'created_at']
    
    # Adds a filter box on the right side of the screen
    list_filter = ['status', 'condition', 'requires_warranty']
    
    # Adds a search bar at the top!
    search_fields = ['buyer__username', 'master_product__name']
    
    readonly_fields = ['created_at']