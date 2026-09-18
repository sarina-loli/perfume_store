from django.urls import path

from .views import CancelPaymentView, CreateCheckoutSessionView, StripeWebhookView, VerifyPaymentView

urlpatterns = [
    path('checkout/', CreateCheckoutSessionView.as_view(), name='payment-checkout'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('cancel/', CancelPaymentView.as_view(), name='payment-cancel'),
    path('webhook/', StripeWebhookView.as_view(), name='payment-webhook'),
]
