from rest_framework import serializers
from .models import Order, Trade, BuyOrder
# Fix: Point to products.models, NOT .models
from products.models import MasterProduct, ProductListing, ListingImage 
from users.models import SellerProfile, BuyerProfile # Adjust path as needed


class OrderSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    product_name = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = Order
        fields = ['id', 'username', 'product', 'product_name', 'order_type', 'price', 'status', 'created_at']
        read_only_fields = ['user', 'status']


class BuyOrderSerializer(serializers.ModelSerializer):
    # 👈 NEW: Reach into the attached 'buyer' model and safely grab their username for React!
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = BuyOrder
        # 👈 ADDED 'buyer_name' to your fields list!
        fields = [
            'id', 
            'buyer_name', 
            'master_product', 
            'bid_price', 
            'condition', 
            'requires_warranty', 
            'status', 
            'created_at'
        ]
        
        # Security: Keep these completely locked so buyers can't hack their own orders
        read_only_fields = ['status', 'created_at', 'buyer_name']

# 1. Fetch the image gallery
class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image']

# 2. Fetch the Seller's contact details
class SellerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ['nickname', 'tier', 'business_name', 'phone', 'city', 'province', 'shop_address', 'is_verified']

# 3. The Master Payload for the Checkout/Listing Page
class ProductListingDetailSerializer(serializers.ModelSerializer):
    # Pull in the images using the related_name='images'
    images = ListingImageSerializer(many=True, read_only=True)
    
    # We will write a custom method to jump across the user model to get the profile
    seller_details = serializers.SerializerMethodField()
    
    # Grab the basic product info from the Master Product
    product_name = serializers.CharField(source='master_product.model_name', read_only=True)
    brand = serializers.CharField(source='master_product.brand', read_only=True)
    stock_image = serializers.URLField(source='master_product.stock_image_url', read_only=True)

    class Meta:
        model = ProductListing
        fields = [
            'id', 'product_name', 'brand', 'stock_image', 'price', 'condition', 
            'description', 'has_warranty', 'warranty_months', 'warranty_info', 
            'images', 'seller_details', 'created_at'
        ]

    def get_seller_details(self, obj):
        # Check if the user actually has a seller profile setup
        if hasattr(obj.seller, 'seller_profile'):
            return SellerContactSerializer(obj.seller.seller_profile).data
        return None
    
class BuyerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = ['display_name', 'full_name', 'phone_no', 'address', 'profile_picture']

# 2. The Master Payload for the Buy Order Page
class BuyOrderDetailSerializer(serializers.ModelSerializer):
    # Custom method to jump across the user model to get the profile
    buyer_details = serializers.SerializerMethodField()
    
    # Grab the basic product info from the Master Product so React can show what they want to buy
    product_name = serializers.CharField(source='master_product.model_name', read_only=True)
    brand = serializers.CharField(source='master_product.brand', read_only=True)
    stock_image = serializers.URLField(source='master_product.stock_image_url', read_only=True)

    class Meta:
        model = BuyOrder
        fields = [
            'id', 'product_name', 'brand', 'stock_image', 'bid_price', 'condition', 
            'requires_warranty', 'status', 'buyer_details', 'created_at'
        ]

    def get_buyer_details(self, obj):
        # Check if the user actually has a buyer profile setup
        if hasattr(obj.buyer, 'buyer_profile'):
            return BuyerContactSerializer(obj.buyer.buyer_profile).data
        return None