from django.db import models
from django.conf import settings
from products.models import ProductListing,MasterProduct # Corrected
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()

class Order(models.Model):
    ORDER_TYPES = (('BUY', 'Buy Order'), ('SELL', 'Sell Order'))
    STATUS_CHOICES = (('OPEN', 'Open'), ('FILLED', 'Filled'), ('CANCELLED', 'Cancelled'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(ProductListing, on_delete=models.CASCADE) # Corrected
    order_type = models.CharField(max_length=4, choices=ORDER_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        # Changed .name to .title to match the ProductListing model
        return f"{self.user.username} | {self.order_type} | {self.product.title} @ {self.price}"

class Trade(models.Model):
    product = models.ForeignKey(ProductListing, on_delete=models.CASCADE) # Corrected
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sales')
    buy_order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='buy_trade')
    sell_order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='sell_trade')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Changed .name to .title to match the ProductListing model
        return f"Trade: {self.product.title} @ {self.price} ({self.timestamp.strftime('%Y-%m-%d')})"

# ... (match_order function remains the same)
    
def match_order(new_order):
    """
    Simple matching engine: 
    - If SELL: find highest BUY >= price.
    - If BUY: find lowest SELL <= price.
    """
    with transaction.atomic():
        if new_order.order_type == 'SELL':
            match = Order.objects.filter(
                product=new_order.product,
                order_type='BUY',
                status='OPEN',
                price__gte=new_order.price
            ).order_by('-price', 'created_at').first()
            
            if match:
                Trade.objects.create(
                    product=new_order.product,
                    buyer=match.user,
                    seller=new_order.user,
                    buy_order=match,
                    sell_order=new_order,
                    price=match.price, # Trade happens at the existing order's price
                    quantity=1
                )
                new_order.status = 'FILLED'
                match.status = 'FILLED'
                new_order.save()
                match.save()

        elif new_order.order_type == 'BUY':
            match = Order.objects.filter(
                product=new_order.product,
                order_type='SELL',
                status='OPEN',
                price__lte=new_order.price
            ).order_by('price', 'created_at').first()
            
            if match:
                Trade.objects.create(
                    product=new_order.product,
                    buyer=new_order.user,
                    seller=match.user,
                    buy_order=new_order,
                    sell_order=match,
                    price=match.price,
                    quantity=1
                )
                new_order.status = 'FILLED'
                match.status = 'FILLED'
                new_order.save()
                match.save()


class BuyOrder(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )
    
    CONDITION_CHOICES = (
        ('new', 'Brand New'),
        ('used', 'Used'),
        ('box_pack', 'Box Pack (Sealed)'),
    )

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buy_orders')
    
    # CRITICAL FIX: The bid is placed on the Master Catalog Item!
    master_product = models.ForeignKey(MasterProduct, on_delete=models.CASCADE, related_name='bids')
    
    bid_price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used')
    requires_warranty = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Updated to reference the master_product's name
        return f"Bid #{self.id} - {self.master_product.model_name} ({self.condition}) by {self.buyer.username}"
    class Meta:
        # The minus sign (-) tells Django to sort descending (Highest price first!)
        ordering = ['-bid_price']