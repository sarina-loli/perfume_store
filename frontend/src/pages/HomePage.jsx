import PerfumeBottleSVG from '../components/PerfumeBottleSVG'
import ProductsSection from '../components/ProductsSection'
import Footer from '../components/Footer'
import { MIST_LETTERS, SPRAY_PARTICLES } from '../data/heroAnimation'

/* ════════════════════════════════════
   HOME PAGE
════════════════════════════════════ */
export default function HomePage({ products, viewDetail, sprayActive, loading, loadError }) {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-image-col">
          <div className="hero-bottle-wrap">
            {/* SVG violet bottle — no photo, no background */}
            <PerfumeBottleSVG />

            {/* Spray origin: anchored to nozzle tip via CSS (left:94.5%, top:7.4%) */}
            <div className={`mist-spray${sprayActive ? ' active' : ''}`}>
              {/* Particles — cone spreading rightward */}
              {SPRAY_PARTICLES.map(p => (
                <div
                  key={p.id}
                  className="spray-particle"
                  style={{
                    width: p.size,
                    height: p.size,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    '--op': p.op,
                    '--dur': `${p.dur}s`,
                    '--del': `${p.delay}s`,
                  }}
                />
              ))}

              {/* VICTORIA text forms in the mist cloud, to the right of the nozzle */}
              <div className={`mist-word${sprayActive ? ' mist-active' : ''}`}>
                {MIST_LETTERS.map((letter, i) => (
                  <span key={i} className="mist-letter">{letter}</span>
                ))}
              </div>

              {/* Quote settles beneath VICTORIA in the same mist cloud */}
             
            </div>
          </div>
        </div>

        <div className="hero-content-col">
          <p className="hero-eyebrow">The Victoria Collection — 2026</p>
          <h1 className="hero-title">
            The Art of<br />
            <em>Rare Fragrance</em>
          </h1>
          <p className="hero-sub">
            Four singular expressions of femininity, each crafted from the world's most precious botanicals. Wear VICTORIA as you wear confidence — effortlessly.
          </p>
          <button className="hero-cta" onClick={scrollToProducts}>
            Explore the Collection
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Down arrow */}
        <button className="hero-down-arrow" onClick={scrollToProducts} aria-label="Scroll to products">
          <span>Discover</span>
          <div className="arrow-chevron" />
        </button>
      </section>

      {/* PRODUCTS */}
      <ProductsSection
        products={products}
        viewDetail={viewDetail}
        loading={loading}
        loadError={loadError}
      />

      <Footer />
    </main>
  )
}
