/* ════════════════════════════════════
   NAVBAR
════════════════════════════════════ */
export default function Navbar({ cartCount, navigate, menuOpen, setMenuOpen, user }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => navigate('/')}>VICTORIA</button>
        

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button className="cart-link" onClick={() => navigate('/')}>Home</button>
          <button onClick={() => navigate('/products')}>Shop</button>
          <button className="cart-link" onClick={() => navigate('/cart')}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button onClick={() => navigate('/about')}>About</button>
          <button onClick={() => navigate('/contact')}>Contact</button>
          {user ? (
            <>
              <button onClick={() => navigate('/orders')}>Orders</button>
              <button onClick={() => navigate('/profile')}>
                <span className="nav-account-name">{user.username}</span>
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>Login</button>
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
