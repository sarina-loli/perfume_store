from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import OrderSerializer


class OrderListCreateView(APIView):
    """
    GET /api/orders/ -> the current user's past orders (newest first),
                         including pending/failed/cancelled attempts.

    Orders are no longer created directly through this endpoint: a real
    payment must be confirmed first. Start a purchase at
    POST /api/payments/checkout/, which creates the (pending) order and
    a hosted Stripe Checkout session; the order is only marked 'paid'
    once the payment is verified (see payments.views).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).select_related('payment')
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        return Response(
            {'detail': 'Direct order creation is disabled. Use /api/payments/checkout/ to pay and check out.'},
            status=status.HTTP_400_BAD_REQUEST,
        )


class OrderDetailView(APIView):
    """GET /api/orders/<id>/ -> a single order belonging to the current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.select_related('payment').get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)
