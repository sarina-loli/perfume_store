// ── Products API ──
import { request } from './client'

export const productsApi = {
  getProducts: () => request('/products/'),
  getProduct: (id) => request(`/products/${id}/`),
}
