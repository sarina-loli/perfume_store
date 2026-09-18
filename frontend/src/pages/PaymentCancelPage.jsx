import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { api } from '../api'

/* ════════════════════════════════════
   PAYMENT CANCELLED — /payment/cancel?order_id=...
   Stripe sends the customer back to this real URL if they close or back
   out of Checkout without paying. Nothing was charged; we just mark the
   pending order as cancelled and let them retry from the cart.
════════════════════════════════════ */
export default function PaymentCancelPage({ navigate }) {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [notified, setNotified] = useState(!orderId)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    api.cancelPayment(orderId)
      .catch(() => { /* best-effort — the order stays pending and can still be verified/retried */ })
      .finally(() => { if (!cancelled) setNotified(true) })
    return () => { cancelled = true }
  }, [orderId])

  return (
    <div className="cart-page payment-result-page">
      <div className="cart-inner">
        <div className="payment-result">
          <div className="payment-result-icon pending">!</div>
          <h1 className="page-title">Payment Cancelled</h1>
          <p className="page-subtitle">
            {notified
              ? "No worries — you weren't charged. Your cart is still here whenever you're ready."
              : 'Wrapping up…'}
          </p>
          <div className="cart-actions" style={{ marginTop: '1.5rem' }}>
            <button className="btn-ghost" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={() => navigate('/cart')}>
              Return to Cart
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
