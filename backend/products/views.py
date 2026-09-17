from rest_framework import viewsets, permissions

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public, read-only endpoints:
      GET /api/products/       -> list all products
      GET /api/products/<id>/  -> a single product's details
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
