import { Navigate, useLocation } from 'react-router-dom'

/* ════════════════════════════════════
   REQUIRE AUTH
   Guards a route that needs a logged-in user (Orders, Checkout, Profile).
   While the app is still checking for a saved token on first load, we
   don't know yet whether the visitor is logged in — render nothing (the
   navbar is already visible) rather than bouncing them to /login and
   right back.
════════════════════════════════════ */
export default function RequireAuth({ user, authLoading, children }) {
  const location = useLocation()

  if (authLoading) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
