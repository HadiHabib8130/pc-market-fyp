from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import SellerProfile, BuyerProfile
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.views import APIView
from .serializers import SellerTokenObtainPairSerializer, FullBuyerProfileSerializer, FullSellerProfileSerializer, BuyerProfileUpdateSerializer, SellerProfileUpdateSerializer

# Import the new, clean serializers we built in Step 1
from .serializers import (
    BuyerRegisterSerializer,
    CustomTokenObtainPairSerializer,
    CurrentBuyerProfileSerializer
)

User = get_user_model()

# ==========================================
# SELLER REGISTRATION (LEFT 100% UNTOUCHED)
# ==========================================
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def register_seller(request):
    data = request.data
    
    try:
        user = User.objects.create_user(
            username=data.get('email'), 
            email=data.get('email'),
            password=data.get('password'),
            role='seller'
        )
        
        SellerProfile.objects.create(
            user=user,
            tier=data.get('tier'),
            full_name=data.get('full_name'),
            father_name=data.get('father_name'),
            phone=data.get('phone'),
            nickname=data.get('nickname'),
            cnic_number=data.get('cnic_number'),
            province=data.get('province'),
            city=data.get('city'),
            shop_address=data.get('address'),
            cnic_front=request.FILES.get('cnic_front'),
            cnic_back=request.FILES.get('cnic_back'),
            face_photo=request.FILES.get('face_photo'),
            shop_photo=request.FILES.get('shop_photo')
        )
        
        return Response({"message": "Seller registered successfully!"}, status=201)
    
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ==========================================
# NEW & BULLETPROOF BUYER REGISTRATION VIEW
# ==========================================
class BuyerRegistrationView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser] # Added parsers to support profile pics smoothly!

    def post(self, request):
        serializer = BuyerRegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Buyer account registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# SECURE LOGIN & INITIAL CHECK VIEW
# ==========================================
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


# ==========================================
# CURRENT USER LOGGED-IN HANDLER PROFILE VIEW
# ==========================================
class CurrentBuyerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = CurrentBuyerProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class SellerTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = SellerTokenObtainPairSerializer

class MyAccountInfoView(APIView):
    """Fetches the logged-in user's core account and profile details."""
    # CRITICAL: This ensures ONLY logged-in users can access this view
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Grab the core user data (same for both buyers and sellers)
        account_data = {
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "profile": None # We will fill this in a second
        }

        # 2. Check their role and attach the correct profile
        if user.role == 'buyer' and hasattr(user, 'buyer_profile'):
            account_data['profile'] = FullBuyerProfileSerializer(user.buyer_profile).data
            
        elif user.role == 'seller' and hasattr(user, 'seller_profile'):
            account_data['profile'] = FullSellerProfileSerializer(user.seller_profile).data

        return Response(account_data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import (
    FullBuyerProfileSerializer, FullSellerProfileSerializer,
    BuyerProfileUpdateSerializer, SellerProfileUpdateSerializer
)

class MyAccountInfoView(APIView):
    """Fetches and Updates the logged-in user's profile."""
    permission_classes = [IsAuthenticated]

    # --- 1. THE GET METHOD (Loads the form data) ---
    def get(self, request):
        user = request.user
        account_data = {
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "profile": None 
        }

        if user.role == 'buyer' and hasattr(user, 'buyer_profile'):
            account_data['profile'] = FullBuyerProfileSerializer(user.buyer_profile).data
        elif user.role == 'seller' and hasattr(user, 'seller_profile'):
            account_data['profile'] = FullSellerProfileSerializer(user.seller_profile).data

        return Response(account_data)

    # --- 2. THE PATCH METHOD (Saves the form data & images) ---
    def patch(self, request):
        user = request.user
        
        if user.role == 'buyer' and hasattr(user, 'buyer_profile'):
            serializer = BuyerProfileUpdateSerializer(
                user.buyer_profile, 
                data=request.data, 
                partial=True
            )
        elif user.role == 'seller' and hasattr(user, 'seller_profile'):
            serializer = SellerProfileUpdateSerializer(
                user.seller_profile, 
                data=request.data, 
                partial=True
            )
        else:
            return Response({"error": "Profile not found or role missing."}, status=status.HTTP_404_NOT_FOUND)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)