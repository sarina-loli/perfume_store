import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { api, getToken, setToken } from './api'
import { normalizeCart } from './utils/normalizeCart'

import Navbar from './components/Navbar'
import RequireAuth from './components/RequireAuth'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import DetailPage from './pages/DetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentCancelPage from './pages/PaymentCancelPage'

/* ════════════════════════════════════
   APP ROOT
   Every page now has its own real URL via React Router, so refreshing,
   sharing a link, or using the browser back/forward buttons all work as
   expected. This component just holds the shared app state (products,
   cart, user, orders) and passes it down to whichever route is active.
════════════════════════════════════ */
export default function App() {
  const routerNavigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [sprayActive, setSprayActive] = useState(false)

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

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
  // `authLoading` tracks this so routes that require a login (Orders,
  // Checkout, Profile) don't bounce a logged-in visitor to /login just
  // because this check hasn't finished yet on a hard refresh.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthLoading(false)
      return
    }
    api.getCurrentUser()
      .then(u => {
        setUser(u)
        refreshCart()
      })
      .catch(() => setToken(null))
      .finally(() => setAuthLoading(false))
  }, [refreshCart])

  const navigate = (path) => {
    routerNavigate(path)
    setMenuOpen(false)
    setCheckoutError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewDetail = (product) => {
    navigate(`/products/${product.id}`)
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
    navigate('/')
  }

  const addToCart = async (product) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (product.stock <= 0) return
    await api.addCartItem(product.id, 1)
    await refreshCart()
    navigate('/cart')
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

  // Starts a real payment: the backend snapshots the cart into a pending
  // order, opens a Stripe Checkout session for it, and hands back a URL
  // to redirect the browser to. The order only becomes "paid" once Stripe
  // confirms the payment — see PaymentSuccessPage.
  const startCheckout = async () => {
    setCheckingOut(true)
    setCheckoutError('')
    try {
      const { checkout_url } = await api.createCheckoutSession()
      window.location.href = checkout_url
    } catch (err) {
      setCheckoutError(err.message)
      setCheckingOut(false)
    }
  }

  // Load order history whenever the Orders page is open.
  useEffect(() => {
    if (location.pathname !== '/orders' || !user) return
    setOrdersLoading(true)
    api.getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [location.pathname, user])

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

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              viewDetail={viewDetail}
              sprayActive={sprayActive}
              loading={productsLoading}
              loadError={productsError}
            />
          }
        />
        <Route
          path="/products"
          element={
            <ProductsPage
              products={products}
              viewDetail={viewDetail}
              loading={productsLoading}
              loadError={productsError}
            />
          }
        />
        <Route
          path="/products/:id"
          element={
            <DetailPage
              products={products}
              productsLoading={productsLoading}
              addToCart={addToCart}
              navigate={navigate}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              updateQty={updateQty}
              cartTotal={cartTotal}
              navigate={navigate}
              user={user}
              checkout={startCheckout}
              checkingOut={checkingOut}
              checkoutError={checkoutError}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth user={user} authLoading={authLoading}>
              <CheckoutPage
                cart={cart}
                cartTotal={cartTotal}
                navigate={navigate}
                checkout={startCheckout}
                checkingOut={checkingOut}
                checkoutError={checkoutError}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth user={user} authLoading={authLoading}>
              <OrdersPage orders={orders} loading={ordersLoading} navigate={navigate} />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage onLoggedIn={handleLoggedIn} navigate={navigate} mode="login" />} />
        <Route path="/register" element={<LoginPage onLoggedIn={handleLoggedIn} navigate={navigate} mode="register" />} />
        <Route
          path="/profile"
          element={
            <RequireAuth user={user} authLoading={authLoading}>
              <AccountPage user={user} onLogout={handleLogout} navigate={navigate} />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage navigate={navigate} onConfirmed={refreshCart} />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage navigate={navigate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
