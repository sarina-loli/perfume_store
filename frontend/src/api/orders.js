// ── Orders API ──
import { request } from './client'

export const ordersApi = {
  getOrders: () => request('/orders/'),
  getOrder: (id) => request(`/orders/${id}/`),
}
