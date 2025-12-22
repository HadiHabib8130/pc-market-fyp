from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    # Metadata for the "Steam" feel
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    @property
    def highest_buy(self):
        # Finds the highest OPEN Buy Order for this product
        order = self.orders.filter(order_type='BUY', status='OPEN').order_by('-price').first()
        return order.price if order else None

    @property
    def lowest_sell(self):
        # Finds the lowest OPEN Sell Order for this product
        order = self.orders.filter(order_type='SELL', status='OPEN').order_by('price').first()
        return order.price if order else None