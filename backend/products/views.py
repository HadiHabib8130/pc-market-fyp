import requests
from django.conf import settings
from django.db.models import Q
from rest_framework import serializers
from market import serializers as market_serializers
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Min, Q
from .models import MasterProduct, ProductListing, ListingImage
from .serializers import MasterProductSerializer, ProductListingSerializer
import operator
from functools import reduce
from market.models import BuyOrder


# --- INTERNAL HELPER FOR ICECAT ---
def get_from_icecat(query, category="Hardware"):
    """Fetches product from Icecat if not found in local database."""
    username = getattr(settings, 'ICECAT_USER', 'hadi8130')
    url = "https://live.icecat.biz/api" 
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json'
    }
    
    params = {
        "UserName": username,
        "Language": "en",
        "SearchText": query,
        "output": "json"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('msg') == 'OK' or 'data' in data:
                product_data = data.get('data', {})
                if product_data:
                    gen_info = product_data.get('GeneralInfo', {})
                    # Create the product locally so we have it for future searches
                    new_master = MasterProduct.objects.create(
                        brand=gen_info.get('Brand', 'Unknown'),
                        model_name=gen_info.get('ProductName', query),
                        category=category,
                        stock_image_url=gen_info.get('ImageHP', '')
                    )
                    return new_master
    except Exception as e:
        print(f"Icecat error: {e}")
    return None


# --- 1. THE SEARCH API (Used for the Dropdown) ---
class MasterProductSearchView(APIView):
    """
    Search local MasterProducts. If none found, tries Icecat.
    URL Example: /api/products/master-search/?category=CPU&q=Ryzen
    """
    permission_classes = [AllowAny]
    def get(self, request):
        query = request.GET.get('q', '').strip()
        category = request.GET.get('category', '').strip()

        if len(query) < 2:
            return Response({"results": []})

        # A. Search Local Database
        queryset = MasterProduct.objects.filter(category=category).filter(
            Q(model_name__icontains=query) | Q(brand__icontains=query)
        )

        # B. Fallback to Icecat if local is empty
        if not queryset.exists():
            new_item = get_from_icecat(query, category)
            if new_item:
                # Wrap in list because serializer expects a queryset/list
                serializer = MasterProductSerializer([new_item], many=True)
                return Response({"results": serializer.data})
            return Response({"results": []})

        # C. Return Local Results
        serializer = MasterProductSerializer(queryset[:10], many=True)
        return Response({"results": serializer.data})


# --- 2. THE LISTING API (To save the final "Add Product" form) ---
class ProductListingCreateView(generics.CreateAPIView):
    """
    Saves the listing and all attached hardware photos.
    """
    queryset = ProductListing.objects.all()
    serializer_class = ProductListingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # 1. Save the main listing and link the seller
        listing = serializer.save(seller=self.request.user)

        # 2. Extract the list of images from the request
        # 'uploaded_images' must match the key you used in React's FormData
        images = self.request.FILES.getlist('uploaded_images')

        # 3. Save each image to the ListingImage table
        for image in images:
            ListingImage.objects.create(listing=listing, image=image)
        
        # Optional: Print to console for debugging
        print(f"✅ Listing created with {len(images)} images.")


# --- 3. HOMEPAGE LISTINGS (To show all active items) ---
class ProductListingListView(generics.ListAPIView):
    queryset = ProductListing.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProductListingSerializer



class MasterProductListView(generics.ListAPIView):
    serializer_class = MasterProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = MasterProduct.objects.all()
        
        category = self.request.query_params.get('category')
        search_query = self.request.query_params.get('q')

        # 1. Filter by Category
        if category and category != 'All':
            queryset = queryset.filter(category__iexact=category)

        # 2. Smart Smart-Search (Tokenized)
        if search_query:
            # Split "ryzen 1300x" into ['ryzen', '1300x']
            words = search_query.strip().split()
            
            if words:
                # Create a list of Q conditions: each word must be in brand OR model_name
                query_conditions = [
                    Q(brand__icontains=word) | Q(model_name__icontains=word)
                    for word in words
                ]
                
                # Combine them using AND logic: word1 AND word2 must match
                queryset = queryset.filter(reduce(operator.and_, query_conditions))
        
        return queryset.annotate(
            min_sell=Min('market_listings__price')
        )
    
class BuyOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyOrder
        fields = ['id', 'bid_price', 'condition', 'requires_warranty', 'created_at']    

class MarketTradingRoomView(APIView):
    """
    Fetches the combined market depth for a single component.
    """
    permission_classes = [AllowAny] 

    def get(self, request, pk):
        try:
            # 1. Get the Master Product
            product = MasterProduct.objects.get(pk=pk)
            product_serializer = MasterProductSerializer(product)
            
            # 2. Get active Sell Orders (Cheapest first)
            # Uses is_active=True because ProductListing has an is_active column
            sell_orders = ProductListing.objects.filter(master_product=product, is_active=True).order_by('price')
            sell_serializer = ProductListingSerializer(sell_orders, many=True)
            
            # 3. Get pending Buy Orders (Highest bid first)
            # Uses status='pending' because BuyOrder has a status column
            buy_orders = BuyOrder.objects.filter(master_product=product, status='pending').order_by('-bid_price')
            buy_serializer = BuyOrderSerializer(buy_orders, many=True)
            
            # 4. Return everything in a single payload
            return Response({
                "product": product_serializer.data,
                "sell_orders": sell_serializer.data,
                "buy_orders": buy_serializer.data
            }, status=status.HTTP_200_OK)
            
        except MasterProduct.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
