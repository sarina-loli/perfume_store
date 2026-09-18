import { Component } from 'react'

/* ════════════════════════════════════
   ERROR BOUNDARY
   Without this, any uncaught render error anywhere in the tree (e.g. a
   product with unexpected/malformed data) unmounts the whole app and
   leaves the visitor staring at a blank white page with no way back.
════════════════════════════════════ */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          fontFamily: "'Raleway', -apple-system, sans-serif",
          background: '#FAF8FF',
          color: '#1A1325',
        }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C4973C', marginBottom: '0.75rem' }}>
            Something Went Wrong
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', color: '#3D2B6A', marginBottom: '1rem' }}>
            This page hit a snag
          </h1>
          <p style={{ color: '#5A4870', marginBottom: '2rem', maxWidth: '420px' }}>
            Please try reloading the page. If the problem keeps happening, let us know.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            style={{
              padding: '1rem 2.5rem',
              background: '#3D2B6A',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
