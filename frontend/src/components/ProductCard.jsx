/* ════════════════════════════════════
   PRODUCT CARD
════════════════════════════════════ */
export default function ProductCard({ product, viewDetail }) {
  return (
    <article className="product-card">
      <div className="product-img-wrap">
        <img src={product.img} alt={product.name} />
        <div className="product-accent-bar" style={{ background: product.accent }} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-tagline">{product.tagline}</p>
        <p className="product-price">${product.price}</p>
        <button className="btn-outline" onClick={() => viewDetail(product)}>
          View Details
        </button>
      </div>
    </article>
  )
}
