from django.contrib import admin
from .models import MasterProduct, ProductListing, Bid, ListingImage

@admin.register(MasterProduct)
class MasterProductAdmin(admin.ModelAdmin):
    # Displaying the important IceCat and hardware info
    list_display = ('brand', 'model_name', 'category', 'icecat_id', 'mpn')
    search_fields = ('brand', 'model_name', 'mpn')
    list_filter = ('category', 'brand')

@admin.register(ProductListing)
class ProductListingAdmin(admin.ModelAdmin):
    # These match the new fields in your model
    list_display = ('seller', 'master_product', 'price', 'condition', 'has_warranty', 'is_active')
    list_filter = ('condition', 'has_warranty', 'is_active')
    search_fields = ('seller__username', 'master_product__model_name', 'master_product__brand')
    readonly_fields = ('created_at',)

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'amount', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('product__title', 'user__username')

    admin.site.register(ListingImage)

# Optional: To see images inside the Listing page itself
class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1

