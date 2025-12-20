from django.db import models
from django.conf import settings
from products.models import Product
from django.db import transaction

class Order(models.Model):
    ORDER_TYPES = (('BUY', 'Buy Order'), ('SELL', 'Sell Order'))
    STATUS_CHOICES = (('OPEN', 'Open'), ('FILLED', 'Filled'), ('CANCELLED', 'Cancelled'))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    order_type = models.CharField(max_length=4, choices=ORDER_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} | {self.order_type} | {self.product.name} @ {self.price}"

class Trade(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sales')
    buy_order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='buy_trade')
    sell_order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='sell_trade')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trade: {self.product.name} @ {self.price} ({self.timestamp.strftime('%Y-%m-%d')})"
    
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