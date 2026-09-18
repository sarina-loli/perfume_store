import logging

import stripe
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from orders.serializers import OrderSerializer
from .models import Payment
from .serializers import PaymentSerializer
from .services import CheckoutError, create_checkout_session, finalize_payment

logger = logging.getLogger(__name__)


class CreateCheckoutSessionView(APIView):
    """
    POST /api/payments/checkout/
    Snapshots the current cart into a pending order, opens a Stripe
    Checkout session for it, and returns the URL to redirect the browser
    to. Nothing is marked paid here - that only happens once Stripe
    confirms the payment (see the webhook / verify views below).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            checkout_url, order_id = create_checkout_session(request.user, request)
        except CheckoutError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            logger.exception('Stripe error while creating checkout session')
            return Response(
                {'detail': 'The payment provider could not be reached. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {'checkout_url': checkout_url, 'order_id': order_id},
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    """
    GET /api/payments/verify/?session_id=...
    Called by the frontend's payment-success page right after Stripe
    redirects back. Acts as a fallback / immediate confirmation path in
    case the webhook hasn't arrived yet (e.g. no webhook forwarding set up
    in local dev) - it asks Stripe directly for the session's real status
    and finalizes the order from that, using the same idempotent
    finalize_payment() the webhook uses, so calling this twice (or racing
    with the webhook) never double-processes anything.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({'detail': 'Missing session_id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.select_related('order').get(
                session_id=session_id, order__user=request.user
            )
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == 'pending':
            stripe.api_key = settings.STRIPE_SECRET_KEY
            try:
                session = stripe.checkout.Session.retrieve(session_id)
            except stripe.error.StripeError:
                logger.exception('Stripe error while verifying session %s', session_id)
                return Response(
                    {'detail': 'Could not verify payment with the provider yet. Please try again shortly.'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            if session.get('status') == 'complete' and session.get('payment_status') == 'paid':
                payment = finalize_payment(payment, 'complete')
            elif session.get('status') == 'expired':
                payment = finalize_payment(payment, 'expired')
            # otherwise still open/unpaid - leave as pending; the frontend
            # can show a "still processing" state and retry.

        return Response({
            'status': payment.status,
            'payment': PaymentSerializer(payment).data,
            'order': OrderSerializer(payment.order).data,
        })


class CancelPaymentView(APIView):
    """
    POST /api/payments/cancel/ {order_id}
    Called from the frontend's payment-cancel page when the customer lands
    there (i.e. they backed out of Stripe Checkout). Only has an effect if
    the order is still pending - a payment that already succeeded can never
    be flipped to cancelled this way.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        try:
            order = Order.objects.select_related('payment').get(pk=order_id, user=request.user)
        except (Order.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status == 'pending':
            order.status = 'cancelled'
            order.save(update_fields=['status'])
            Payment.objects.filter(order=order, status='pending').update(status='cancelled')

        return Response(OrderSerializer(order).data)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    POST /api/payments/webhook/
    Stripe calls this directly (not the browser), so there's no user to
    authenticate - instead the request is verified using the signed
    Stripe-Signature header against STRIPE_WEBHOOK_SECRET. This is the
    authoritative confirmation path in production; VerifyPaymentView is a
    same-request fallback for when the webhook hasn't landed yet.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        if not settings.STRIPE_WEBHOOK_SECRET:
            logger.error('Received Stripe webhook but STRIPE_WEBHOOK_SECRET is not set.')
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            logger.warning('Invalid Stripe webhook signature/payload.')
            return Response(status=status.HTTP_400_BAD_REQUEST)

        obj = event['data']['object']
        session_id = obj.get('id')
        event_type = event['type']

        if event_type in (
            'checkout.session.completed',
            'checkout.session.expired',
            'checkout.session.async_payment_failed',
        ):
            try:
                payment = Payment.objects.get(session_id=session_id)
            except Payment.DoesNotExist:
                # Not one of ours (or already cleaned up) - acknowledge so
                # Stripe doesn't keep retrying.
                return Response(status=status.HTTP_200_OK)

            if event_type == 'checkout.session.completed':
                provider_status = 'complete' if obj.get('payment_status') == 'paid' else 'failed'
            elif event_type == 'checkout.session.expired':
                provider_status = 'expired'
            else:
                provider_status = 'failed'

            finalize_payment(payment, provider_status)

        return Response(status=status.HTTP_200_OK)
