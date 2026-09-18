import { useState } from 'react'
import { api } from '../api'

/* ════════════════════════════════════
   LOGIN / REGISTER
════════════════════════════════════ */
export default function LoginPage({ onLoggedIn, navigate }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = mode === 'login'
        ? await api.login(username, password)
        : await api.register(username, email, password)
      await onLoggedIn(data.token)
      navigate('home')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="page-subtitle">
          {mode === 'login' ? 'Sign in to view your cart and orders' : 'Join Victoria to start shopping'}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-field">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>

          {mode === 'register' && (
            <div className="form-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          )}

          <div className="form-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
