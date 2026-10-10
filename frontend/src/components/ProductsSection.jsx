import ProductCard from './ProductCard'

/* ════════════════════════════════════
   PRODUCTS SECTION
   The product grid, shared by the Home page (below the hero) and the
   standalone /products page.
════════════════════════════════════ */
export default function ProductsSection({ products, viewDetail, productsLoading, productsError, eyebrow = 'Haute Parfumerie', title = 'The Collection', hideHeader = false }) {
  return (
    <section id="products" className="products-section">
      {!hideHeader && (
        <div className="section-header">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
          <div className="section-rule" />
        </div>
      )}

      {productsLoading && <p className="page-subtitle" style={{ textAlign: 'center' }}>Loading the collection…</p>}
      {productsError && (
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Couldn't reach the store server. Please make sure the backend is running, then refresh.
        </p>
      )}

      {!productsLoading && !productsError && (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} viewDetail={viewDetail} />
          ))}
        </div>
      )}
    </section>
  )
}
