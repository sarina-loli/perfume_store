import Footer from '../components/Footer'

/* ════════════════════════════════════
   PRODUCT DETAIL
════════════════════════════════════ */
export default function DetailPage({ product, addToCart, navigate }) {
  // A missing product (bad navigation state, stale link, etc.) used to
  // render nothing at all — a blank page with just the navbar. Show a
  // recoverable message instead.
  if (!product) {
    return (
      <div className="detail-page">
        <div className="detail-inner" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className="detail-content">
            <p className="detail-eyebrow">Not Found</p>
            <h1 className="detail-name">We couldn't find that product</h1>
            <p className="detail-desc">
              It may have been removed, or the link is out of date.
            </p>
            <button className="btn-primary" onClick={() => navigate('home')}>
              Back to Collection
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Defensive fallbacks: a product created/edited through the admin panel
  // without every field set should degrade gracefully, not crash the page.
  const name = product.name || 'Untitled'
  const [firstWord, ...restWords] = name.split(' ')
  const notes = Array.isArray(product.notes) ? product.notes : []
  const stock = typeof product.stock === 'number' ? product.stock : null
  const outOfStock = stock !== null && stock <= 0
  const lowStock = stock !== null && stock > 0 && stock <= 5

  return (
    <div className="detail-page">
      <div className="detail-inner">
        <div className="detail-visual">
          <div className="detail-platform">
            <div className="bottle-stage">
              <div className="bottle-rotating">
                <img
                  className="detail-bottle-img"
                  src={product.img}
                  alt={name}
                />
              </div>
            </div>
            <div className="platform-shadow" />
          </div>
        </div>

        <div className="detail-content">
          <button className="detail-back-btn" onClick={() => navigate('home')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Collection
          </button>

          <p className="detail-eyebrow">
            Eau de Parfum{product.category_display ? ` · ${product.category_display}` : ''}
          </p>
          <h1 className="detail-name">
            <em>{firstWord}</em>{restWords.length ? ' ' + restWords.join(' ') : ''}
          </h1>
          <p className="detail-price">${product.price}</p>

          <div className="detail-divider" />

          {product.description && <p className="detail-desc">{product.description}</p>}

          {notes.length > 0 && (
            <>
              <p className="detail-notes-label">Fragrance Notes</p>
              <div className="detail-notes">
                {notes.map(note => (
                  <span key={note} className="note-pill">{note}</span>
                ))}
              </div>
            </>
          )}

          <div className="detail-meta-row">
            {product.size && <span className="detail-size">{product.size}</span>}
            {stock !== null && (
              <span className={`detail-stock${outOfStock ? ' out' : lowStock ? ' low' : ''}`}>
                {outOfStock ? 'Out of Stock' : lowStock ? `Only ${stock} left` : `${stock} in stock`}
              </span>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={() => addToCart(product)}
            disabled={outOfStock}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            {!outOfStock && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6" cy="13" r="1" fill="currentColor" />
                <circle cx="12" cy="13" r="1" fill="currentColor" />
                <path d="M1 1h2l2 8h7l1.5-5H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
