import { useState, useEffect, useCallback } from 'react'
import { api, getToken, setToken } from './api'
import { normalizeCart } from './utils/normalizeCart'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

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
