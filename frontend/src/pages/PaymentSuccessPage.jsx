import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import { api } from '../api'

/* ════════════════════════════════════
   PAYMENT SUCCESS
   Stripe redirects here after a completed Checkout session. We don't
   trust the redirect alone — the backend re-checks the payment status
   with Stripe directly before we show anything as confirmed.
════════════════════════════════════ */
export default function PaymentSuccessPage({ sessionId, navigate, onConfirmed }) {
  const [state, setState] = useState('verifying') // 'verifying' | 'succeeded' | 'pending' | 'failed' | 'error'
  const [order, setOrder] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setState('error')
      setErrorMessage('Missing payment reference.')
      return
    }

    let cancelled = false
    api.verifyPayment(sessionId)
      .then(data => {
        if (cancelled) return
        setOrder(data.order)
        if (data.status === 'succeeded') {
          setState('succeeded')
          onConfirmed?.()
        } else if (data.status === 'pending') {
          setState('pending')
        } else {
          setState('failed')
        }
      })
      .catch(err => {
        if (cancelled) return
        setState('error')
        setErrorMessage(err.message)
      })

    return () => { cancelled = true }
  }, [sessionId, onConfirmed])

  return (
    <div className="cart-page payment-result-page">
      <div className="cart-inner">
        {state === 'verifying' && (
          <div className="payment-result">
            <div className="payment-spinner" />
            <h1 className="page-title">Confirming your payment…</h1>
            <p className="page-subtitle">This only takes a moment.</p>
          </div>
        )}

        {state === 'succeeded' && order && (
          <div className="payment-result">
            <div className="payment-result-icon success">✓</div>
            <h1 className="page-title">Payment Successful</h1>
            <p className="page-subtitle">Thank you — your order has been confirmed.</p>

            <div className="order-block">
              <div className="order-block-header">
                <span className="order-id">Order #{order.id}</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                <span className="order-status">{order.status}</span>
              </div>
              <div className="cart-items">
                {order.items.map(item => (
                  <div key={item.id} className="cart-item">
                    <img className="cart-item-img" src={item.product?.img} alt={item.product_name} />
                    <div className="cart-item-details">
                      <h4>{item.product_name}</h4>
                      <p className="price">${item.price} each</p>
                      <p className="tagline">Qty {item.quantity}</p>
                    </div>
                    <div className="cart-item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-block-total">
                <span>Total Paid</span>
                <span>${order.total}</span>
              </div>
            </div>

            <div className="cart-actions" style={{ marginTop: '2rem' }}>
              <button className="btn-ghost" onClick={() => navigate('home')}>
                Continue Shopping
              </button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={() => navigate('orders')}>
                View My Orders
              </button>
            </div>
          </div>
        )}

        {state === 'pending' && (
          <div className="payment-result">
            <div className="payment-result-icon pending">…</div>
            <h1 className="page-title">Still Processing</h1>
            <p className="page-subtitle">
              Your payment is being confirmed by the provider. This can take a few seconds —
              check your order history shortly.
            </p>
            <div className="cart-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('orders')}>
                Check Order Status
              </button>
            </div>
          </div>
        )}

        {(state === 'failed' || state === 'error') && (
          <div className="payment-result">
            <div className="payment-result-icon failed">✕</div>
            <h1 className="page-title">Payment Not Completed</h1>
            <p className="page-subtitle">
              {errorMessage || "We couldn't confirm this payment. You haven't been charged for a failed attempt, and your cart has been kept as-is."}
            </p>
            <div className="cart-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('cart')}>
                Back to Cart
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
