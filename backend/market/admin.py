from django.contrib import admin
from .models import Order, Trade

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'order_type', 'price', 'status', 'created_at']
    list_filter = ['order_type', 'status', 'product']

@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ['product', 'buyer', 'seller', 'price', 'timestamp']
    readonly_fields = ['timestamp']