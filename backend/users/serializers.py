from rest_framework import serializers
from .models import SellerProfile, BuyerProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed
from django.db.models import Q
from .models import BuyerProfile, SellerProfile
User = get_user_model()

# ==========================================
# SELLER SERIALIZERS (LEFT 100% UNTOUCHED)
# ==========================================
class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = [
            'full_name', 'father_name', 'cnic_number', 'tier', 
            'city', 'business_name', 'shop_address', 'ntn_number', 
            'cnic_front', 'cnic_back', 'shop_photo', 'status'
        ]
        read_only_fields = ['status']

    def create(self, validated_data):
        user = self.context['request'].user
        return SellerProfile.objects.create(user=user, **validated_data)


# ==========================================
# NEW: BUYER REGISTRATION SERIALIZER
# ==========================================
class BuyerRegisterSerializer(serializers.ModelSerializer):
    # Explicitly declare the custom profile text fields
    display_name = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    father_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone_no = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    profile_picture = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        # 1. CRITICAL: Add all frontend keys to your Meta fields list so Django processes them!
        fields = [
            'username', 'email', 'password', 'display_name', 
            'full_name', 'father_name', 'phone_no', 'address', 'profile_picture'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # 2. Extract ALL custom profile data variables cleanly
        display_name = validated_data.pop('display_name')
        full_name = validated_data.pop('full_name')
        father_name = validated_data.pop('father_name', '')
        phone_no = validated_data.pop('phone_no')
        address = validated_data.pop('address')
        profile_picture = validated_data.pop('profile_picture', None)

        # 3. Create core system auth user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='buyer'
        )

        # 4. Map them explicitly to their matching model database columns!
        BuyerProfile.objects.create(
            user=user,
            full_name=full_name,          # Saved correctly!
            father_name=father_name,      # Saved correctly!
            display_name=display_name,    # Saved correctly!
            phone_no=phone_no,            # Saved correctly!
            address=address,              # Saved correctly!
            profile_picture=profile_picture # File saved correctly!
        )
        return user


# ==========================================
# SECURE LOGIN TOKEN SERIALIZER
# ==========================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # 1. FORCE ACCEPTANCE: Tell DRF to accept either 'email' or 'username' keys from React 
    # without throwing a 400 Bad Request rejection!
    email = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        # 2. Capture whichever key React decided to send
        login_input = attrs.get('email') or attrs.get('username')
        password_input = attrs.get('password')

        # Custom safeguard
        if not login_input:
            raise AuthenticationFailed("An email address is required to log in.")

        # 3. Look up the user cleanly
        try:
            user = User.objects.get(email__iexact=login_input)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password credentials.")

        # 4. Check the password
        if not user.check_password(password_input):
            raise AuthenticationFailed("Invalid email or password credentials.")

        if not user.is_active:
            raise AuthenticationFailed("This account is currently deactivated.")

        # 5. MANUALLY GENERATE TOKENS (Bypasses all parent library strictness)
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        self.user = user

        # 6. HARD PORTAL GATE: Block access if the database marks them as a seller
        if self.user.role == 'seller':
            raise AuthenticationFailed(
                "This account is registered as a Seller. Please use a Buyer account to access this portal."
            )

        # 7. Safely append profile response data maps for your React layout
        data['id'] = self.user.id
        data['email'] = self.user.email
        data['role'] = self.user.role

        if hasattr(self.user, 'buyer_profile') and self.user.buyer_profile:
            profile = self.user.buyer_profile
            data['display_name'] = profile.display_name if profile.display_name else self.user.username
            if profile.profile_picture:
                data['profile_picture'] = f"http://127.0.0.1:8000{profile.profile_picture.url}"
            else:
                data['profile_picture'] = None
        else:
            data['display_name'] = self.user.username
            data['profile_picture'] = None

        return data

class SellerTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        login_input = attrs.get('email') or attrs.get('username')
        password_input = attrs.get('password')

        if not login_input:
            raise AuthenticationFailed("An email address is required to log in.")

        try:
            user = User.objects.get(email__iexact=login_input)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password credentials.")

        if not user.check_password(password_input):
            raise AuthenticationFailed("Invalid email or password credentials.")

        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        self.user = user

        # HARD PORTAL GATE: Block access if a Buyer tries to log in here!
        if self.user.role == 'buyer':
            raise AuthenticationFailed(
                "This account is registered as a Buyer. Please use the main marketplace login."
            )

        # Safely append seller profile data for React
        data['id'] = self.user.id
        data['email'] = self.user.email
        data['role'] = self.user.role

        # If they have a seller profile, send the business name to the frontend!
        if hasattr(self.user, 'sellerprofile') and self.user.sellerprofile:
            data['business_name'] = self.user.sellerprofile.business_name
        else:
            data['business_name'] = "Merchant"

        return data
# ==========================================
# CURRENT ACCOUNT PROFILE SERIALIZER
# ==========================================
class CurrentBuyerProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'profile_picture']

    def get_display_name(self, obj):
        if hasattr(obj, 'buyer_profile') and obj.buyer_profile and obj.buyer_profile.display_name:
            return obj.buyer_profile.display_name
        return obj.username

    def get_profile_picture(self, obj):
        if hasattr(obj, 'buyer_profile') and obj.buyer_profile and obj.buyer_profile.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.buyer_profile.profile_picture.url)
            return obj.buyer_profile.profile_picture.url
        return None
    

class FullBuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = '__all__' # Grabs every single field automatically!

class FullSellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = '__all__'

# 1. Serializer for updating Buyer details
class BuyerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        # Only allow them to edit these specific fields safely
        fields = ['full_name', 'father_name', 'display_name', 'phone_no', 'address', 'profile_picture']

# 2. Serializer for updating Seller details
class SellerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        # Keep sensitive fields like CNIC, tier, and status OUT of this list!
        fields = ['full_name', 'father_name', 'nickname', 'phone', 'business_name', 'province', 'city', 'shop_address', 'shop_photo', 'face_photo']