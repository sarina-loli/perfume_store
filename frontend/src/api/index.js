// ── API barrel ──
// All backend communication lives under this folder, split by resource:
//   client.js   – shared fetch wrapper + auth token storage
//   products.js – product catalog
//   auth.js     – register / login / logout / current user
//   cart.js     – cart items
//   orders.js   – order history
//   payments.js – Stripe checkout session
//
// Import what you need from here, e.g.:
//   import { productsApi, authApi } from '../api'

export { getToken, setToken } from './client'
export { productsApi } from './products'
export { authApi } from './auth'
export { cartApi } from './cart'
export { ordersApi } from './orders'
export { paymentsApi } from './payments'
