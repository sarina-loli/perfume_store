from decimal import Decimal

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer

TAX_RATE = Decimal('0.08')  # 8%, matches the frontend's cart summary


class OrderListCreateView(APIView):
    """
    GET  /api/orders/ -> the current user's past orders (newest first)
    POST /api/orders/ -> checks out the current cart and creates an order
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        items = list(cart.items.select_related('product').all())
        if not items:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum(item.subtotal() for item in items)
        tax = (subtotal * TAX_RATE).quantize(Decimal('0.01'))
        total = subtotal + tax

        order = Order.objects.create(user=request.user, subtotal=subtotal, tax=tax, total=total)
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity,
            )

        # The cart is emptied once its contents become an order.
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """GET /api/orders/<id>/ -> a single order belonging to the current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)
