import Footer from '../components/Footer'

/* ════════════════════════════════════
   CHECKOUT — /checkout
   A final order review before handing off to Stripe. Reuses the same
   `startCheckout` flow the cart page always used (create a pending order,
   then redirect to Stripe Checkout) — nothing about how payment actually
   works has changed, this just gives it its own URL.
════════════════════════════════════ */
export default function CheckoutPage({ cart, cartTotal, navigate, checkout, checkingOut, checkoutError }) {
  const tax = +(cartTotal * 0.08).toFixed(2)
  const grand = +(cartTotal + tax).toFixed(2)

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-inner">
          <h1 className="page-title">Checkout</h1>
          <div className="cart-empty">
            <div className="cart-empty-icon">✦</div>
            <h3>Your cart is empty</h3>
            <p>Add something to your cart before checking out.</p>
            <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('/')}>
              Explore Collection
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Review your order before payment</p>

        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img className="cart-item-img" src={item.img} alt={item.name} />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p className="tagline">{item.tagline} · {item.size}</p>
                <p className="price">${item.price} each · Qty {item.qty}</p>
              </div>
              <div className="cart-item-total">
                ${(item.price * item.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span style={{ color: 'var(--gold)' }}>Complimentary</span>
          </div>
          <div className="cart-summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${grand.toFixed(2)}</span>
          </div>

          {checkoutError && (
            <p className="checkout-error" role="alert">{checkoutError}</p>
          )}

          <div className="cart-actions">
            <button className="btn-ghost" onClick={() => navigate('/cart')}>
              Back to Cart
            </button>
            <button className="btn-paypal" onClick={checkout} disabled={checkingOut}>
              {checkingOut ? (
                <span className="btn-spinner" aria-hidden="true" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.479 9.883c.129-.829-.008-1.393-.443-1.933-.478-.588-1.348-.84-2.462-.84H7.322a.6.6 0 00-.594.508l-1.42 9.013a.36.36 0 00.355.416h1.94l.487-3.086-.015.096a.6.6 0 01.594-.508h1.238c2.436 0 4.344-.99 4.902-3.856.017-.086.031-.17.043-.253M12.44 9.913c-.264 1.72-1.577 1.72-2.847 1.72h-.723l.507-3.215a.3.3 0 01.297-.254h.25c.865 0 1.682 0 2.103.494.25.294.327.732.213 1.255" />
                </svg>
              )}
              {checkingOut ? 'Redirecting to payment…' : 'Proceed to Secure Payment'}
            </button>
          </div>
          <p className="checkout-secure-note">
            🔒 Payments are processed securely by Stripe. We never see or store your card details.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
