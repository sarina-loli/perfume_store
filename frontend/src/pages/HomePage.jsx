import ScrollSequence from '../components/ScrollSequence'
import ProductsSection from '../components/ProductsSection'
import Footer from '../components/Footer'
import { backgroundUrl } from '../config/sequence'

/* Same outlined arrow button the old hero used; shown in the intro and outro. */
function ExploreButton({ onClick }) {
  return (
    <button className="hero-copy__cta" onClick={onClick}>
      Explore the Collection
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/* ════════════════════════════════════
   HOME PAGE
════════════════════════════════════ */
export default function HomePage({ products, viewDetail, productsLoading, productsError }) {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      {/* HERO — pinned, scroll-controlled frame sequence over a blurred copy of its final frame */}
      <ScrollSequence
        background={backgroundUrl}
        label="Violet flowers drift together and transform into a Victoria perfume bottle as you scroll down, and reverse as you scroll back up."
      >
        <div className="hero-copy">
          <div className="hero-copy__part hero-copy__top">
            <p className="hero-copy__eyebrow">The Victoria Collection — 2026</p>
            <h1 className="hero-copy__heading">
              The Art of<br />
              <em>Rare Fragrance</em>
            </h1>
          </div>

          <div className="hero-copy__part hero-copy__bottom">
            <p className="hero-copy__description">
              Four singular expressions of femininity, each crafted from the world's most precious botanicals. Wear VICTORIA as you wear confidence — effortlessly.
            </p>
            <ExploreButton onClick={scrollToProducts} />
            <p className="hero-copy__hint">Scroll to discover</p>
          </div>

          <div className="hero-copy__outro">
            <p className="hero-copy__closing">Four singular expressions, waiting to be worn.</p>
            <ExploreButton onClick={scrollToProducts} />
          </div>
        </div>
      </ScrollSequence>

      {/* PRODUCTS */}
      <ProductsSection
        products={products}
        viewDetail={viewDetail}
        productsLoading={productsLoading}
        productsError={productsError}
      />

      <Footer />
    </main>
  )
}
