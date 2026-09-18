"""
Payment logic, kept separate from views.py so the request/response plumbing
(views.py) stays thin and this file can be unit tested on its own.

Design: Stripe Checkout (hosted, redirect-based). The backend creates a
Checkout Session and hands the frontend only a URL to redirect to - card
details never touch our server or the React app, and the Stripe secret key
never leaves the backend process. The frontend doesn't need any Stripe key
at all for this flow.
"""
from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import F

from cart.models import Cart
from orders.models import Order, OrderItem
from products.models import Product
from .models import Payment

TAX_RATE = Decimal('0.08')  # 8%, matches the frontend's cart summary


class CheckoutError(Exception):
    """Raised for problems the caller should show back to the user (400s)."""


def _stripe_configured():
    return bool(settings.STRIPE_SECRET_KEY)


def create_checkout_session(user, request):
    """
    Snapshots the user's cart into a pending Order + OrderItems, creates a
    Stripe Checkout Session for the total, and records a pending Payment.

    Returns (checkout_url, order_id). Raises CheckoutError for problems the
    user can fix (empty cart, insufficient stock) and stripe.error.StripeError
    for provider-side failures.
    """
    if not _stripe_configured():
        raise CheckoutError(
            'Payments are not configured on this server yet. Set STRIPE_SECRET_KEY.'
        )

    try:
        cart = Cart.objects.get(user=user)
    except Cart.DoesNotExist:
        raise CheckoutError('Your cart is empty.')

    items = list(cart.items.select_related('product').all())
    if not items:
        raise CheckoutError('Your cart is empty.')

    # Soft stock check up front so we don't bother creating a Stripe session
    # for something we already know we can't fulfill. The authoritative
    # check happens again, atomically, when the payment is confirmed.
    for item in items:
        if item.quantity > item.product.stock:
            raise CheckoutError(
                f'Only {item.product.stock} of "{item.product.name}" left in stock.'
            )

    subtotal = sum(item.subtotal() for item in items)
    tax = (subtotal * TAX_RATE).quantize(Decimal('0.01'))
    total = subtotal + tax

    stripe.api_key = settings.STRIPE_SECRET_KEY

    with transaction.atomic():
        order = Order.objects.create(
            user=user, subtotal=subtotal, tax=tax, total=total, status='pending'
        )
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity,
            )

        line_items = [
            {
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': item.product.name},
                    'unit_amount': int(item.product.price * 100),
                },
                'quantity': item.quantity,
            }
            for item in items
        ]
        # Tax as its own line item, since Checkout doesn't know about our
        # flat 8% rate automatically.
        line_items.append({
            'price_data': {
                'currency': 'usd',
                'product_data': {'name': 'Tax'},
                'unit_amount': int(tax * 100),
            },
            'quantity': 1,
        })

        frontend_url = settings.FRONTEND_URL.rstrip('/')
        try:
            session = stripe.checkout.Session.create(
                mode='payment',
                payment_method_types=['card'],
                line_items=line_items,
                success_url=f'{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{frontend_url}/payment/cancel?order_id={order.id}',
                client_reference_id=str(order.id),
                customer_email=getattr(user, 'email', None) or None,
                metadata={'order_id': str(order.id), 'user_id': str(user.id)},
            )
        except stripe.error.StripeError:
            # Roll back the pending order/items too - transaction.atomic()
            # handles that automatically when this exception propagates.
            raise

        Payment.objects.create(
            order=order,
            session_id=session.id,
            status='pending',
            amount=total,
            currency='usd',
        )

    return session.url, order.id


def finalize_payment(payment, provider_status):
    """
    Idempotently applies the outcome of a payment attempt.

    provider_status is one of: 'complete' (paid), 'expired', or anything
    else (treated as a failure). Safe to call more than once for the same
    payment (e.g. once from the webhook and once from the verify endpoint) -
    a payment that's already in a terminal state is left untouched.
    """
    with transaction.atomic():
        payment = Payment.objects.select_for_update().get(pk=payment.pk)

        if payment.status in ('succeeded', 'failed', 'cancelled'):
            # Already processed - never re-run side effects (stock
            # decrement, cart clearing) a second time.
            return payment

        order = payment.order

        if provider_status == 'complete':
            items = list(order.items.select_related('product').all())
            for item in items:
                if item.product_id is None:
                    continue
                updated = Product.objects.filter(
                    pk=item.product_id, stock__gte=item.quantity
                ).update(stock=F('stock') - item.quantity)
                if not updated:
                    # Stock disappeared between checkout and confirmation.
                    # The charge itself already succeeded on Stripe's side,
                    # so this is flagged for manual refund/fulfillment
                    # rather than silently failing.
                    payment.status = 'failed'
                    payment.save(update_fields=['status', 'updated_at'])
                    order.status = 'failed'
                    order.save(update_fields=['status'])
                    return payment

            payment.status = 'succeeded'
            payment.save(update_fields=['status', 'updated_at'])
            order.status = 'paid'
            order.save(update_fields=['status'])

            # Only clear the cart once payment is actually confirmed.
            cart = Cart.objects.filter(user=order.user).first()
            if cart:
                cart.items.all().delete()

        elif provider_status == 'expired':
            payment.status = 'cancelled'
            payment.save(update_fields=['status', 'updated_at'])
            order.status = 'cancelled'
            order.save(update_fields=['status'])

        else:
            payment.status = 'failed'
            payment.save(update_fields=['status', 'updated_at'])
            order.status = 'failed'
            order.save(update_fields=['status'])

    return payment
