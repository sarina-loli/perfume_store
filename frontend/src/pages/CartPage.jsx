import Footer from '../components/Footer'

/* ════════════════════════════════════
   CART
════════════════════════════════════ */
export default function CartPage({ cart, updateQty, cartTotal, navigate, user, checkout, checkingOut }) {
  const shipping = cartTotal > 0 ? 0 : 0
  const tax = +(cartTotal * 0.08).toFixed(2)
  const grand = +(cartTotal + tax).toFixed(2)

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="page-title">Your Cart</h1>
        <p className="page-subtitle">
          {cart.length === 0 ? 'Empty' : `${cart.reduce((s, i) => s + i.qty, 0)} item${cart.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}`}
        </p>

        {!user && (
          <p className="page-subtitle" style={{ marginTop: '-2rem', marginBottom: '2rem' }}>
            <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.6rem 1.5rem' }} onClick={() => navigate('login')}>
              Log in to view your cart
            </button>
          </p>
        )}

        {user && cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">✦</div>
            <h3>Your cart is empty</h3>
            <p>Discover the Victoria Collection and find your signature scent.</p>
            <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('home')}>
              Explore Collection
            </button>
          </div>
        ) : user && (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img className="cart-item-img" src={item.img} alt={item.name} />

                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="tagline">{item.tagline} · {item.size}</p>
                    <p className="price">${item.price} each</p>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
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

              <div className="cart-actions">
                <button className="btn-ghost" onClick={() => navigate('home')}>
                  Continue Shopping
                </button>
                <button className="btn-paypal" onClick={checkout} disabled={checkingOut}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.144 19.532l1.049-5.751c.11-.606.721-1.087 1.338-1.087h6.288c2.553 0 4.761-1.718 5.37-4.228C22.096 5.007 20.009 2 16.536 2H7.55a1.33 1.33 0 00-1.315 1.12L3.943 17.979c-.063.37.226.714.6.714H6.92c.3 0 .571-.214.634-.51l.59-2.65z"/>
                    <path d="M20.189 8.466c-.577 2.926-2.814 4.784-5.741 4.784H9.536l-.814 4.468-.38 2.09a.51.51 0 00.504.592h3.325c.481 0 .898-.347.975-.822l.57-3.145a.99.99 0 01.975-.822h.617c3.128 0 5.58-1.87 6.145-4.974.253-1.384.082-2.58-.264-3.171z"/>
                  </svg>
                  {checkingOut ? 'Placing Order…' : 'Pay with PayPal'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
