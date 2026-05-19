from rest_framework import serializers
from .models import MasterProduct, ProductListing, ListingImage
from django.db.models import Max
from market.models import BuyOrder
class MasterProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterProduct
        fields = '__all__'

class ProductListingSerializer(serializers.ModelSerializer):
    # This shows the master product details (name, photo) inside the listing
    master_product_details = MasterProductSerializer(source='master_product', read_only=True)

    class Meta:
        model = ProductListing
        fields = [
            'id', 'master_product', 'master_product_details', 'price', 
            'condition', 'description', 'has_warranty', 
            'warranty_months', 'warranty_info', 'created_at'
        ]

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image']

class ProductListingSerializer(serializers.ModelSerializer):
    master_product_details = MasterProductSerializer(source='master_product', read_only=True)
    # This allows us to see the list of images for each listing
    images = ListingImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductListing
        fields = [
            'id', 'master_product', 'master_product_details', 'images', 
            'price', 'condition', 'description', 'has_warranty', 
            'warranty_months', 'warranty_info', 'created_at'
        ]

class MasterProductSerializer(serializers.ModelSerializer):
    min_sell = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    max_buy = serializers.SerializerMethodField()

    class Meta:
        model = MasterProduct
        # Ensure max_buy is in the fields list
        fields = ['id', 'brand', 'model_name', 'category', 'stock_image_url', 'min_sell', 'max_buy']

    def get_max_buy(self, obj):
        # 2. CRITICAL FIX: Query the specific table directly instead of using obj.bids!
        highest = BuyOrder.objects.filter(
            master_product=obj, 
            status='pending'
        ).aggregate(Max('bid_price'))['bid_price__max']
        
        return highest if highest else None