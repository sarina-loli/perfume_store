// ── Payments API ──
// Checkout redirects to a Stripe-hosted page, so the frontend never
// needs a Stripe key of any kind.
import { request } from './client'

export const paymentsApi = {
  createCheckoutSession: () => request('/payments/checkout/', { method: 'POST' }),
  verifyPayment: (sessionId) =>
    request(`/payments/verify/?session_id=${encodeURIComponent(sessionId)}`),
  cancelPayment: (orderId) =>
    request('/payments/cancel/', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }),
}
