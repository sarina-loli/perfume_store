// ── Simple API client for the Django REST backend ──
// Every function here just wraps `fetch`, so it's easy to read and extend.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'victoria_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Token ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  // DELETE requests may come back with no body
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message =
      (data && (data.detail || data.error || Object.values(data).flat().join(' '))) ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }
  return data
}

export const api = {
  // Products
  getProducts: () => request('/products/'),
  getProduct: (id) => request(`/products/${id}/`),

  // Auth / users
  register: (username, email, password) =>
    request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  login: (username, password) =>
    request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request('/auth/logout/', { method: 'POST' }),
  getCurrentUser: () => request('/auth/user/'),

  // Cart
  getCart: () => request('/cart/'),
  addCartItem: (productId, quantity = 1) =>
    request('/cart/items/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  updateCartItem: (productId, quantity) =>
    request(`/cart/items/${productId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (productId) =>
    request(`/cart/items/${productId}/`, { method: 'DELETE' }),

  // Orders
  createOrder: () => request('/orders/', { method: 'POST' }),
  getOrders: () => request('/orders/'),
}
