from django.db import models
from django.conf import settings
from django.utils import timezone
from users.models import SellerProfile

class MasterProduct(models.Model):
    """
    The Global Encyclopedia: Stores specs and stock photos from IceCat.
    Ensures that 'Gigabyte GTX 1060' is the same entry for everyone.
    """
    CATEGORY_CHOICES = [
        ('GPU', 'Graphics Card'),
        ('CPU', 'Processor'),
        ('RAM', 'Memory'),
        ('MOBO', 'Motherboard'),
        ('SSD', 'Solid State Drive'),
        ('HDD', 'Hard Disk Drive'),
        ('PSU', 'Power Supply'),
        ('CASE', 'Casing'),
        ('COOLER', 'CPU Cooler'),
    ]

    icecat_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    mpn = models.CharField(max_length=100, blank=True, help_text="Manufacturer Part Number")
    brand = models.CharField(max_length=100)
    model_name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Official Manufacturer Image (Stock Photo)
    stock_image_url = models.URLField(max_length=500, null=True, blank=True)
    
    # Stores hardware specs (e.g., VRAM: 3GB, Clock: 1506MHz)
    specs_json = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ('brand', 'model_name')
        verbose_name = "Master Product"

    def __str__(self):
        return f"{self.brand} {self.model_name} ({self.category})"


from django.db import models
from django.conf import settings # To link to your User model
from .models import MasterProduct

class ProductListing(models.Model):
    CONDITION_CHOICES = [
        ('NEW', 'Brand New'),
        ('OPEN', 'Open Box'),
        ('USED', 'Used'),
    ]

    # The Core Links
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    master_product = models.ForeignKey(MasterProduct, on_delete=models.CASCADE, related_name='market_listings')

    # Listing Details
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='USED')
    description = models.TextField(help_text="Describe the specific condition/history of your item")
    
    # Warranty Section
    has_warranty = models.BooleanField(default=False)
    warranty_months = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in months")
    warranty_info = models.TextField(null=True, blank=True, help_text="What is/isn't included")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.seller.username} - {self.master_product.model_name} ({self.price} PKR)"
    
    

class ListingImage(models.Model):
    # This links the image to your specific listing
    listing = models.ForeignKey('ProductListing', related_name='images', on_delete=models.CASCADE)
    # This stores the actual file
    image = models.ImageField(upload_to='listings/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.listing.id}"
    
class Bid(models.Model):
    """
    Tracks the auction history for a listing.
    """
    product = models.ForeignKey(ProductListing, on_delete=models.CASCADE, related_name='bids')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-amount']

    def __str__(self):
        return f"{self.user.username} - {self.amount} PKR"
    

class BuyOrder(models.Model):
    CONDITION_CHOICES = [
        ('New', 'New'),
        ('Used', 'Used'),
        ('Open Box', 'Open Box'),
    ]

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    master_product = models.ForeignKey(MasterProduct, related_name='buy_orders', on_delete=models.CASCADE)
    bid_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # New specification fields
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='Used')
    requires_warranty = models.BooleanField(default=False, help_text="True if the buyer insists on having a warranty")
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        warranty_status = "w/ Warranty" if self.requires_warranty else "No Warranty"
        return f"Rs.{self.bid_price} Bid for {self.condition} ({warranty_status}) on {self.master_product.model_name}"
    
