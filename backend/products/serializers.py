from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'tagline', 'price', 'size', 'img', 'accent', 'notes',
            'description', 'category', 'category_display', 'stock', 'in_stock',
        ]
