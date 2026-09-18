/* ════════════════════════════════════
   ACCOUNT
════════════════════════════════════ */
export default function AccountPage({ user, onLogout, navigate }) {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>My Account</h1>
        <p className="page-subtitle">You're signed in</p>

        <div className="form-field">
          <label>Username</label>
          <input type="text" value={user.username} disabled />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input type="text" value={user.email || '—'} disabled />
        </div>

        <button className="btn-outline" onClick={() => navigate('orders')} style={{ marginBottom: '1rem' }}>
          View My Orders
        </button>
        <button className="btn-primary" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}
