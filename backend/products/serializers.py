from rest_framework import serializers
from .models import Product, Category

class ProductSerializer(serializers.ModelSerializer):
    # This 'flattens' the category relationship to just show the name string
    category = serializers.ReadOnlyField(source='category.name')
    highest_buy = serializers.ReadOnlyField() # Includes the property above
    lowest_sell = serializers.ReadOnlyField() # Includes the property above

    class Meta:
        model = Product
        # Explicitly listing fields is safer for your API
        fields = ['id', 'name', 'slug', 'description', 'image', 'category', 'created_at','highest_buy', 'lowest_sell']