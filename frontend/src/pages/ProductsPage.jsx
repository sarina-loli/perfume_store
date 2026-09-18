import ProductsSection from '../components/ProductsSection'
import Footer from '../components/Footer'

/* ════════════════════════════════════
   PRODUCTS (shop the full collection — /products)
════════════════════════════════════ */
export default function ProductsPage({ products, viewDetail, loading, loadError }) {
  return (
    <main>
      <div className="section-header" style={{ marginTop: '3rem' }}>
        <p className="section-eyebrow">Haute Parfumerie</p>
        <h1 className="section-title">Shop the Collection</h1>
        <div className="section-rule" />
      </div>

      <ProductsSection
        products={products}
        viewDetail={viewDetail}
        loading={loading}
        loadError={loadError}
        hideHeader
      />

      <Footer />
    </main>
  )
}
