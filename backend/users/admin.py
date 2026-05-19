from django.contrib import admin
from django.utils.safestring import mark_safe # Needed for images
from .models import SellerProfile, BuyerProfile
from django.contrib.auth.admin import UserAdmin

from django.contrib.auth import get_user_model # <-- Add this import

# Grab your custom User model cleanly
User = get_user_model()

@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    # Added 'created_at' back here
    list_display = ('user', 'tier', 'status', 'is_verified', 'created_at')
    list_filter = ('tier', 'status', 'is_verified')
    
    # These match the 'readonly_fields' below
    readonly_fields = ('cnic_front_preview', 'cnic_back_preview')

    def cnic_front_preview(self, obj):
        if obj.cnic_front:
            return mark_safe(f'<img src="{obj.cnic_front.url}" width="200" />')
        return "No Image"
    
    def cnic_back_preview(self, obj):
        if obj.cnic_back:
            return mark_safe(f'<img src="{obj.cnic_back.url}" width="200" />')
        return "No Image"

@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'full_name', 'phone_no', 'created_at']
    search_fields = ['display_name', 'full_name']

admin.site.register(User, UserAdmin)