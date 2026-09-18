from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer


def _get_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartDetailView(APIView):
    """GET /api/cart/ -> the current user's cart."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = _get_cart(request.user)
        return Response(CartSerializer(cart).data)


class CartItemAddView(APIView):
    """
    POST /api/cart/items/ {product_id, quantity} -> adds the product to
    the cart, or increases its quantity if it's already there.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        product = get_object_or_404(Product, id=product_id)

        cart = _get_cart(request.user)
        existing = CartItem.objects.filter(cart=cart, product=product).first()
        new_quantity = quantity + (existing.quantity if existing else 0)

        if new_quantity > product.stock:
            return Response(
                {'detail': f'Only {product.stock} of "{product.name}" left in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if existing:
            existing.quantity = new_quantity
            existing.save()
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=new_quantity)

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """
    PATCH  /api/cart/items/<product_id>/ {quantity} -> set the exact quantity
    DELETE /api/cart/items/<product_id>/             -> remove the item
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, product_id):
        cart = _get_cart(request.user)
        item = get_object_or_404(CartItem, cart=cart, product_id=product_id)

        quantity = int(request.data.get('quantity', item.quantity))
        if quantity <= 0:
            item.delete()
        else:
            if quantity > item.product.stock:
                return Response(
                    {'detail': f'Only {item.product.stock} of "{item.product.name}" left in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = quantity
            item.save()

        return Response(CartSerializer(cart).data)

    def delete(self, request, product_id):
        cart = _get_cart(request.user)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart).data)
