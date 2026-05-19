from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')

    # Force Django to use Email as the primary unique identifier for lookups
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

class SellerProfile(models.Model):
    TIER_CHOICES = [
        ('INDIVIDUAL', 'Individual'),
        ('PROFESSIONAL', 'Professional')
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='seller_profile'
    )
    
    # --- IDENTITY FIELDS ---
    full_name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    nickname = models.CharField(max_length=100, unique=True , help_text="Display Name")
    phone = models.CharField(max_length=15)
    cnic_number = models.CharField(max_length=15) # Format: 00000-0000000-0
    
    # --- TIER & BUSINESS ---
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='INDIVIDUAL')
    business_name = models.CharField(max_length=255, blank=True, null=True)
    ntn_number = models.CharField(max_length=50, blank=True, null=True)
    
    # --- LOCATION ---
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    shop_address = models.TextField(help_text="Used for Shop Address or Residential Address")
    
    # --- KYC / VERIFICATION DOCUMENTS (16:9 Optimized) ---
    cnic_front = models.ImageField(upload_to='verification/cnic/', null=True)
    cnic_back = models.ImageField(upload_to='verification/cnic/', null=True)
    face_photo = models.ImageField(upload_to='verification/faces/', null=True)
    shop_photo = models.ImageField(upload_to='verification/shops/', blank=True, null=True)
    
    # --- STATUS & TRACKING ---
    is_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nickname or self.full_name} ({self.tier}) - {self.status}"
    
class BuyerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_profile')
    full_name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100, blank=True, null=True)
    display_name = models.CharField(max_length=50, unique=True)
    phone_no = models.CharField(max_length=15)
    address = models.TextField()
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"@{self.display_name} ({self.full_name})"