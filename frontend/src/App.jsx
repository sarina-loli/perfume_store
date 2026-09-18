import { useState, useEffect, useCallback } from 'react'
import { api, getToken, setToken } from './api'

const MIST_LETTERS = 'VICTORIA'.split('')

/* ── Spray particles — deterministic, cone-shaped expanding rightward ── */
const SPRAY_PARTICLES = [
  /* close layer — dense, opaque */
  { id:  0, tx:  90, ty:  -6, size: 10, delay: 0.00, dur: 2.0, op: 0.72 },
  { id:  1, tx: 120, ty:  14, size:  8, delay: 0.04, dur: 1.9, op: 0.68 },
  { id:  2, tx: 100, ty: -20, size:  7, delay: 0.08, dur: 2.1, op: 0.65 },
  { id:  3, tx: 140, ty:   5, size: 12, delay: 0.03, dur: 2.2, op: 0.60 },
  { id:  4, tx:  80, ty:  22, size:  9, delay: 0.10, dur: 1.8, op: 0.70 },
  /* mid layer — spreading */
  { id:  5, tx: 190, ty: -10, size: 18, delay: 0.06, dur: 2.4, op: 0.50 },
  { id:  6, tx: 220, ty:  30, size: 16, delay: 0.12, dur: 2.3, op: 0.48 },
  { id:  7, tx: 200, ty: -38, size: 14, delay: 0.15, dur: 2.5, op: 0.45 },
  { id:  8, tx: 260, ty:  18, size: 22, delay: 0.09, dur: 2.6, op: 0.42 },
  { id:  9, tx: 170, ty:  45, size: 13, delay: 0.18, dur: 2.2, op: 0.52 },
  { id: 10, tx: 240, ty: -50, size: 17, delay: 0.14, dur: 2.7, op: 0.40 },
  /* far layer — large, diffuse */
  { id: 11, tx: 330, ty:   8, size: 32, delay: 0.16, dur: 3.0, op: 0.30 },
  { id: 12, tx: 370, ty:  55, size: 28, delay: 0.20, dur: 3.2, op: 0.27 },
  { id: 13, tx: 350, ty: -62, size: 26, delay: 0.22, dur: 3.1, op: 0.28 },
  { id: 14, tx: 420, ty:  25, size: 38, delay: 0.25, dur: 3.4, op: 0.22 },
  { id: 15, tx: 400, ty: -38, size: 30, delay: 0.28, dur: 3.3, op: 0.25 },
  { id: 16, tx: 460, ty:  70, size: 44, delay: 0.32, dur: 3.6, op: 0.18 },
  /* outermost wisps */
  { id: 17, tx: 500, ty:  15, size: 52, delay: 0.35, dur: 3.8, op: 0.14 },
  { id: 18, tx: 480, ty: -80, size: 40, delay: 0.30, dur: 3.5, op: 0.16 },
  { id: 19, tx: 540, ty:  45, size: 60, delay: 0.40, dur: 4.2, op: 0.10 },
]

/* ── SVG violet perfume bottle ── */
function PerfumeBottleSVG() {
  return (
    <svg
      viewBox="0 0 220 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hero-bottle-svg"
      aria-label="Victoria violet perfume bottle"
    >
      <defs>
        {/* Body glass gradient — violet */}
        <linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#5B3F9E" />
          <stop offset="22%"  stopColor="#7A5CC0" />
          <stop offset="48%"  stopColor="#9B7FD8" />
          <stop offset="72%"  stopColor="#8268C6" />
          <stop offset="100%" stopColor="#4E3490" />
        </linearGradient>
        {/* Cap gradient — deep violet / near-black */}
        <linearGradient id="capG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#3A2570" />
          <stop offset="100%" stopColor="#1E1040" />
        </linearGradient>
        {/* Neck gradient */}
        <linearGradient id="neckG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#6A4FB8" />
          <stop offset="50%"  stopColor="#8B72CE" />
          <stop offset="100%" stopColor="#5A40A8" />
        </linearGradient>
        {/* Glass highlight — soft white streak on left side */}
        <linearGradient id="highlightG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Nozzle gradient */}
        <linearGradient id="nozzleG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#2E1A58" />
          <stop offset="100%" stopColor="#1A0E38" />
        </linearGradient>
        {/* Drop shadow filter */}
        <filter id="bottleShadow" x="-20%" y="-5%" width="140%" height="115%">
          <feDropShadow dx="0" dy="20" stdDeviation="14" floodColor="rgba(60,30,120,0.35)" />
        </filter>
      </defs>

      {/* ── Bottom floor shadow ── */}
      <ellipse cx="110" cy="485" rx="70" ry="9" fill="rgba(80,40,160,0.18)" />

      {/* ── Body ── */}
      {/* Shoulder left */}
      <path d="M38,148 Q38,118 72,105 L88,102 L88,148 Z" fill="url(#bodyG)" />
      {/* Shoulder right */}
      <path d="M182,148 Q182,118 148,105 L132,102 L132,148 Z" fill="url(#bodyG)" />
      {/* Main body rect */}
      <rect x="38" y="148" width="144" height="316" rx="5" fill="url(#bodyG)" filter="url(#bottleShadow)" />
      {/* Glass sheen on body */}
      <rect x="38" y="148" width="144" height="316" rx="5" fill="url(#highlightG)" />
      {/* Left edge inner highlight */}
      <rect x="52" y="156" width="14" height="298" rx="3" fill="rgba(255,255,255,0.11)" />
      {/* Right edge inner shadow */}
      <rect x="162" y="156" width="10" height="298" rx="2" fill="rgba(0,0,0,0.12)" />

      {/* ── Label area ── */}
      <rect x="52" y="222" width="116" height="170" rx="2"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.6"
      />
      {/* Decorative thin rules */}
      <line x1="66" y1="242" x2="154" y2="242" stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" />
      <line x1="66" y1="368" x2="154" y2="368" stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" />
      {/* Brand name */}
      <text x="110" y="296"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="4"
        fill="rgba(255,255,255,0.92)"
      >VICTORIA</text>
      {/* Sub-text */}
      <text x="110" y="318"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="7"
        fontWeight="400"
        letterSpacing="2.5"
        fill="rgba(255,255,255,0.50)"
      >EAU DE PARFUM</text>
      {/* Small ornament */}
      <text x="110" y="270"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="9"
        fill="rgba(255,255,255,0.35)"
        letterSpacing="1"
      >✦</text>

      {/* ── Neck ── */}
      <rect x="74" y="72" width="72" height="33" rx="2" fill="url(#neckG)" />
      {/* Neck highlight */}
      <rect x="80" y="72" width="12" height="33" fill="rgba(255,255,255,0.10)" />

      {/* ── Cap / Actuator block ── */}
      <rect x="62" y="18" width="96" height="56" rx="4" fill="url(#capG)" />
      {/* Cap top highlight */}
      <rect x="62" y="18" width="96" height="7" rx="4" fill="rgba(255,255,255,0.10)" />
      {/* Cap right highlight line */}
      <rect x="152" y="22" width="4" height="48" rx="2" fill="rgba(255,255,255,0.06)" />

      {/* ── Pump actuator button (top of cap) ── */}
      <rect x="99" y="6" width="22" height="16" rx="5" fill="#150C2E" />
      <rect x="99" y="6" width="22" height="5" rx="5" fill="rgba(255,255,255,0.08)" />

      {/* ── Nozzle tube — horizontal, exits right side of cap ── */}
      {/* Main tube */}
      <rect x="158" y="32" width="52" height="11" rx="3.5" fill="url(#nozzleG)" />
      {/* Tube top highlight */}
      <rect x="158" y="32" width="52" height="3" rx="2" fill="rgba(255,255,255,0.12)" />
      {/* Tube end cap (the exit opening) */}
      <rect x="208" y="30" width="5" height="15" rx="1.5" fill="#0F081E" />
      {/* Tiny opening hole */}
      <rect x="210" y="35" width="2" height="5" rx="1" fill="#1A0E38" />

      {/* ── Bottom base plate ── */}
      <rect x="34" y="456" width="152" height="10" rx="3" fill="#3D2580" opacity="0.55" />
    </svg>
  )
}

/* ════════════════════════════════════
   NAVBAR
════════════════════════════════════ */
function Navbar({ cartCount, navigate, menuOpen, setMenuOpen, user }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => navigate('home')}>VICTORIA</button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => navigate('home')}>Shop</button>
          <button className="cart-link" onClick={() => navigate('cart')}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button onClick={() => navigate('about')}>About</button>
          <button onClick={() => navigate('contact')}>Contact</button>
          {user ? (
            <>
              <button onClick={() => navigate('orders')}>Orders</button>
              <button onClick={() => navigate('account')}>
                <span className="nav-account-name">{user.username}</span>
              </button>
            </>
          ) : (
            <button onClick={() => navigate('login')}>Login</button>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}

/* ════════════════════════════════════
   HOME PAGE
════════════════════════════════════ */
function HomePage({ products, viewDetail, sprayActive, loading, loadError }) {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-image-col">
          <div className="hero-bottle-wrap">
            {/* SVG violet bottle — no photo, no background */}
            <PerfumeBottleSVG />

            {/* Spray origin: anchored to nozzle tip via CSS (left:94.5%, top:7.4%) */}
            <div className={`mist-spray${sprayActive ? ' active' : ''}`}>
              {/* Particles — cone spreading rightward */}
              {SPRAY_PARTICLES.map(p => (
                <div
                  key={p.id}
                  className="spray-particle"
                  style={{
                    width: p.size,
                    height: p.size,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    '--op': p.op,
                    '--dur': `${p.dur}s`,
                    '--del': `${p.delay}s`,
                  }}
                />
              ))}

              {/* VICTORIA text forms in the mist cloud, to the right of the nozzle */}
              <div className={`mist-word${sprayActive ? ' mist-active' : ''}`}>
                {MIST_LETTERS.map((letter, i) => (
                  <span key={i} className="mist-letter">{letter}</span>
                ))}
              </div>

              {/* Quote settles beneath VICTORIA in the same mist cloud */}
              <p className={`mist-quote${sprayActive ? ' mist-active' : ''}`}>
                Elegance that lingers, beauty that stays.
              </p>
            </div>
          </div>
        </div>

        <div className="hero-content-col">
          <p className="hero-eyebrow">The Victoria Collection — 2026</p>
          <h1 className="hero-title">
            The Art of<br />
            <em>Rare Fragrance</em>
          </h1>
          <p className="hero-sub">
            Four singular expressions of femininity, each crafted from the world's most precious botanicals. Wear VICTORIA as you wear confidence — effortlessly.
          </p>
          <button className="hero-cta" onClick={scrollToProducts}>
            Explore the Collection
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Down arrow */}
        <button className="hero-down-arrow" onClick={scrollToProducts} aria-label="Scroll to products">
          <span>Discover</span>
          <div className="arrow-chevron" />
        </button>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products-section">
        <div className="section-header">
          <p className="section-eyebrow">Haute Parfumerie</p>
          <h2 className="section-title">The Collection</h2>
          <div className="section-rule" />
        </div>

        {loading && <p className="page-subtitle" style={{ textAlign: 'center' }}>Loading the collection…</p>}
        {loadError && (
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            Couldn't reach the store server. Please make sure the backend is running, then refresh.
          </p>
        )}

        {!loading && !loadError && (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} viewDetail={viewDetail} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

function ProductCard({ product, viewDetail }) {
  return (
    <article className="product-card">
      <div className="product-img-wrap">
        <img src={product.img} alt={product.name} />
        <div className="product-accent-bar" style={{ background: product.accent }} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-tagline">{product.tagline}</p>
        <p className="product-price">${product.price}</p>
        <button className="btn-outline" onClick={() => viewDetail(product)}>
          View Details
        </button>
      </div>
    </article>
  )
}

/* ════════════════════════════════════
   PRODUCT DETAIL
════════════════════════════════════ */
function DetailPage({ product, addToCart, navigate }) {
  if (!product) return null

  return (
    <div className="detail-page">
      <div className="detail-inner">
        <div className="detail-visual">
          <div className="detail-platform">
            <div className="bottle-stage">
              <div className="bottle-rotating">
                <img
                  className="detail-bottle-img"
                  src={product.img}
                  alt={product.name}
                />
              </div>
            </div>
            <div className="platform-shadow" />
          </div>
        </div>

        <div className="detail-content">
          <button className="detail-back-btn" onClick={() => navigate('home')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Collection
          </button>

          <p className="detail-eyebrow">Eau de Parfum</p>
          <h1 className="detail-name">
            <em>{product.name.split(' ')[0]}</em>{' '}
            {product.name.split(' ').slice(1).join(' ')}
          </h1>
          <p className="detail-price">${product.price}</p>

          <div className="detail-divider" />

          <p className="detail-desc">{product.description}</p>

          <p className="detail-notes-label">Fragrance Notes</p>
          <div className="detail-notes">
            {product.notes.map(note => (
              <span key={note} className="note-pill">{note}</span>
            ))}
          </div>

          <p className="detail-size">{product.size}</p>

          <button className="btn-primary" onClick={() => addToCart(product)}>
            Add to Cart
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="13" r="1" fill="currentColor" />
              <circle cx="12" cy="13" r="1" fill="currentColor" />
              <path d="M1 1h2l2 8h7l1.5-5H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ════════════════════════════════════
   CART
════════════════════════════════════ */
function CartPage({ cart, updateQty, cartTotal, navigate, user, checkout, checkingOut }) {
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

/* ════════════════════════════════════
   LOGIN / REGISTER
════════════════════════════════════ */
function LoginPage({ onLoggedIn, navigate }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = mode === 'login'
        ? await api.login(username, password)
        : await api.register(username, email, password)
      await onLoggedIn(data.token)
      navigate('home')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="page-subtitle">
          {mode === 'login' ? 'Sign in to view your cart and orders' : 'Join Victoria to start shopping'}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-field">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>

          {mode === 'register' && (
            <div className="form-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          )}

          <div className="form-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   ACCOUNT
════════════════════════════════════ */
function AccountPage({ user, onLogout, navigate }) {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>My Account</h1>
        <p className="page-subtitle">You're signed in</p>

        <div className="form-field">
          <label>Username</label>
          <input type="text" value={user.username} disabled />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input type="text" value={user.email || '—'} disabled />
        </div>

        <button className="btn-outline" onClick={() => navigate('orders')} style={{ marginBottom: '1rem' }}>
          View My Orders
        </button>
        <button className="btn-primary" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   ORDERS
════════════════════════════════════ */
function OrdersPage({ orders, loading, navigate }) {
  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="page-title">Your Orders</h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        </p>

        {!loading && orders.length === 0 && (
          <div className="cart-empty">
            <div className="cart-empty-icon">✦</div>
            <h3>No orders yet</h3>
            <p>Once you check out, your orders will appear here.</p>
            <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('home')}>
              Explore Collection
            </button>
          </div>
        )}

        {orders.map(order => (
          <div className="order-block" key={order.id}>
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
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}

/* ════════════════════════════════════
   ABOUT
════════════════════════════════════ */
function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <img
          src="https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?w=1400&h=600&fit=crop&auto=format"
          alt="Victoria atelier"
        />
        <div className="about-hero-overlay">
          <h1>The Victoria Story</h1>
          <p>Perfumery as a Fine Art</p>
        </div>
      </div>

      <div className="about-inner">
        <div className="about-block">
          <p className="about-block-label">Our Origin</p>
          <h2>Born of a singular obsession with beauty</h2>
          <p>
            VICTORIA was founded in Paris in 2019 by master perfumer Élise Marchand, whose thirty years among the jasmine fields of Grasse gave her an intimate understanding of what makes a fragrance transcend — not just the notes, but the narrative they carry on the skin.
          </p>
          <p>
            The house was built around a single conviction: that great perfume is inseparable from great storytelling. Each VICTORIA fragrance is a chapter — composed with the precision of poetry and the patience of a craftsperson who refuses to rush something rare.
          </p>
        </div>

        <div className="about-block">
          <p className="about-block-label">Our Philosophy</p>
          <h2>No shortcuts. No compromises.</h2>
          <p>
            We source raw materials exclusively from their regions of origin — Bulgarian roses harvested at dawn, Madagascan vanilla cured for eighteen months, Hindi oud aged in traditional distilleries. Each ingredient is chosen because there is simply no substitute for the real thing.
          </p>
          <p>
            Our fragrances are never diluted to mass-market expectations. Every bottle holds a full concentration, a full expression — because you deserve nothing less.
          </p>
        </div>

        <div className="about-values">
          <div className="about-value">
            <h4>Provenance</h4>
            <p>Every ingredient traced to its single origin, selected for purity above all else.</p>
          </div>
          <div className="about-value">
            <h4>Longevity</h4>
            <p>High-concentration formulas that evolve beautifully over twelve or more hours on skin.</p>
          </div>
          <div className="about-value">
            <h4>Restraint</h4>
            <p>Four fragrances only. Each one irreplaceable. No seasonal releases, no compromise.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ════════════════════════════════════
   CONTACT
════════════════════════════════════ */
function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-inner">
        <div className="contact-left">
          <p className="section-eyebrow" style={{ marginBottom: '1rem' }}>Get in Touch</p>
          <h1>
            We'd love to<br />
            <em>hear from you</em>
          </h1>
          <p>
            Whether you have a question about our fragrances, need help selecting your scent, or wish to inquire about wholesale partnerships — our team is delighted to assist.
          </p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="contact-icon">✉</div>
              <div>
                <p className="label">Email</p>
                <p className="value">hello@victoriaperfume.com<br />press@victoriaperfume.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">☎</div>
              <div>
                <p className="label">Phone</p>
                <p className="value">+1 (212) 555 0184<br />Mon – Fri, 9am – 6pm EST</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">◈</div>
              <div>
                <p className="label">Address</p>
                <p className="value">12 Rue du Faubourg Saint-Honoré<br />75008 Paris, France</p>
              </div>
            </div>
          </div>

          <div className="contact-social">
            <p className="label">Follow Victoria</p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Instagram">IG</a>
              <a href="#" className="social-link" aria-label="Pinterest">PI</a>
              <a href="#" className="social-link" aria-label="TikTok">TK</a>
              <a href="#" className="social-link" aria-label="Facebook">FB</a>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <h3>Send a Message</h3>

          <div className="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="form-field">
            <label>Email Address</label>
            <input type="email" placeholder="your@email.com" />
          </div>
          <div className="form-field">
            <label>Subject</label>
            <input type="text" placeholder="How can we help?" />
          </div>
          <div className="form-field">
            <label>Message</label>
            <textarea placeholder="Tell us more…" />
          </div>

          <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={e => e.preventDefault()}>
            Send Message
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ════════════════════════════════════
   FOOTER
════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer">
      <p className="footer-brand">VICTORIA</p>
      <p className="footer-copy">© 2026 Victoria Parfums. All rights reserved.</p>
    </footer>
  )
}

/* ── Helper: turn the backend's cart shape into the flat shape the UI uses ── */
function normalizeCart(apiCart) {
  if (!apiCart || !apiCart.items) return []
  return apiCart.items.map(i => ({
    id: i.product.id,
    name: i.product.name,
    tagline: i.product.tagline,
    price: i.product.price,
    size: i.product.size,
    img: i.product.img,
    accent: i.product.accent,
    qty: i.quantity,
  }))
}

/* ════════════════════════════════════
   APP ROOT
════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sprayActive, setSprayActive] = useState(false)

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)

  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [checkingOut, setCheckingOut] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSprayActive(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Prevent background scroll while the mobile nav panel is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Load the product catalog from the backend on first render.
  useEffect(() => {
    api.getProducts()
      .then(data => setProducts(data))
      .catch(() => setProductsError(true))
      .finally(() => setProductsLoading(false))
  }, [])

  const refreshCart = useCallback(async () => {
    try {
      const data = await api.getCart()
      setCart(normalizeCart(data))
    } catch {
      setCart([])
    }
  }, [])

  // If a token is already saved (returning visitor), log the user back in.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    api.getCurrentUser()
      .then(u => {
        setUser(u)
        refreshCart()
      })
      .catch(() => setToken(null))
  }, [refreshCart])

  const navigate = (p) => {
    setPage(p)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewDetail = (product) => {
    setSelectedProduct(product)
    navigate('detail')
  }

  const handleLoggedIn = async (token) => {
    setToken(token)
    const u = await api.getCurrentUser()
    setUser(u)
    await refreshCart()
  }

  const handleLogout = async () => {
    try { await api.logout() } catch { /* token may already be invalid */ }
    setToken(null)
    setUser(null)
    setCart([])
    navigate('home')
  }

  const addToCart = async (product) => {
    if (!user) {
      navigate('login')
      return
    }
    await api.addCartItem(product.id, 1)
    await refreshCart()
    navigate('cart')
  }

  const updateQty = async (id, delta) => {
    const current = cart.find(i => i.id === id)
    if (!current) return
    const newQty = current.qty + delta
    if (newQty <= 0) {
      await api.removeCartItem(id)
    } else {
      await api.updateCartItem(id, newQty)
    }
    await refreshCart()
  }

  const checkout = async () => {
    setCheckingOut(true)
    try {
      await api.createOrder()
      await refreshCart()
      navigate('orders')
    } catch (err) {
      alert(err.message)
    } finally {
      setCheckingOut(false)
    }
  }

  // Load order history whenever the Orders page is opened.
  useEffect(() => {
    if (page !== 'orders' || !user) return
    setOrdersLoading(true)
    api.getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [page, user])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div className="app">
      <Navbar
        cartCount={cartCount}
        navigate={navigate}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        user={user}
      />

      {page === 'home' && (
        <HomePage
          products={products}
          viewDetail={viewDetail}
          sprayActive={sprayActive}
          loading={productsLoading}
          loadError={productsError}
        />
      )}
      {page === 'detail' && (
        <DetailPage
          product={selectedProduct}
          addToCart={addToCart}
          navigate={navigate}
        />
      )}
      {page === 'cart' && (
        <CartPage
          cart={cart}
          updateQty={updateQty}
          cartTotal={cartTotal}
          navigate={navigate}
          user={user}
          checkout={checkout}
          checkingOut={checkingOut}
        />
      )}
      {page === 'login' && <LoginPage onLoggedIn={handleLoggedIn} navigate={navigate} />}
      {page === 'account' && user && <AccountPage user={user} onLogout={handleLogout} navigate={navigate} />}
      {page === 'orders' && <OrdersPage orders={orders} loading={ordersLoading} navigate={navigate} />}
      {page === 'about' && <AboutPage />}
      {page === 'contact' && <ContactPage />}
    </div>
  )
}
