// ── Core HTTP client for the Django REST backend ──
// Every feature-specific API file (products.js, auth.js, cart.js, ...)
// builds on the `request` helper here, so the base URL, auth token
// handling, and error/JSON parsing only need to live in one place.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'victoria_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function request(path, options = {}) {
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
