// ── Auth / users API ──
import { request } from './client'

export const authApi = {
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
}
