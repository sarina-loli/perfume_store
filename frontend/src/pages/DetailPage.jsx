import Footer from '../components/Footer'

/* ════════════════════════════════════
   PRODUCT DETAIL
════════════════════════════════════ */
export default function DetailPage({ product, addToCart, navigate }) {
  if (!product) return null

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
                  alt={product.name}
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

          <p className="detail-eyebrow">Eau de Parfum</p>
          <h1 className="detail-name">
            <em>{product.name.split(' ')[0]}</em>{' '}
            {product.name.split(' ').slice(1).join(' ')}
          </h1>
          <p className="detail-price">${product.price}</p>

          <div className="detail-divider" />

          <p className="detail-desc">{product.description}</p>

          <p className="detail-notes-label">Fragrance Notes</p>
          <div className="detail-notes">
            {product.notes.map(note => (
              <span key={note} className="note-pill">{note}</span>
            ))}
          </div>

          <p className="detail-size">{product.size}</p>

          <button className="btn-primary" onClick={() => addToCart(product)}>
            Add to Cart
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="13" r="1" fill="currentColor" />
              <circle cx="12" cy="13" r="1" fill="currentColor" />
              <path d="M1 1h2l2 8h7l1.5-5H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
