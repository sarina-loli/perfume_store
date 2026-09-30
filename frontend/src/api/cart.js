// ── Cart API ──
import { request } from './client'

export const cartApi = {
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
}
