import { useRef, useState, useMemo } from 'react'
import ProductsSection from '../components/ProductsSection'
import Footer from '../components/Footer'
import useScrollFrames from '../hooks/useScrollFrames'

/* ════════════════════════════════════
   HOME PAGE — Veloura
   A tall "film" section holds a sticky full-screen stage. Scrolling through
   it scrubs the 60-frame sequence (purple flowers → crystal perfume bottle)
   on a <canvas>. Captions and the closing call-to-action are faded in sync
   with the same scroll progress. Below it: the product grid and footer.
════════════════════════════════════ */

const FRAME_COUNT = 60
const BASE = import.meta.env.BASE_URL || '/'

// Phones/tablets (touch) get the lighter 540px set; desktops get the 810px set.
const pickTier = () => {
  if (typeof window === 'undefined') return 'sm'
  const touch = window.matchMedia('(pointer: coarse)').matches
  return touch || window.innerWidth < 900 ? 'sm' : 'lg'
}

export default function HomePage({ products, viewDetail, productsLoading, productsError }) {
  const trackRef = useRef(null)
  const canvasRef = useRef(null)
  const capA = useRef(null)
  const capB = useRef(null)
  const capC = useRef(null)
  const cue = useRef(null)
  const finale = useRef(null)
  const [ready, setReady] = useState(false)
  const [loadRatio, setLoadRatio] = useState(0)

  const tier = useMemo(pickTier, [])
  const overlays = useMemo(() => [
    { ref: cue, from: -0.2, to: 0.08 },
    { ref: capA, from: 0.05, to: 0.27 },
    { ref: capB, from: 0.32, to: 0.54 },
    { ref: capC, from: 0.58, to: 0.8 },
    { ref: finale, from: 0.86, to: 1, hold: true },
  ], [])

  useScrollFrames({
    sectionRef: trackRef,
    canvasRef,
    frameCount: FRAME_COUNT,
    frameUrl: (i) => `${BASE}frames/${tier}/${String(i + 1).padStart(3, '0')}.webp`,
    overlays,
    onLoad: setLoadRatio,
    onReady: () => setReady(true),
  })

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <section className="film" ref={trackRef} aria-label="Veloura — from petals to perfume">
        <div className="film-stage">
          <div className="film-frame">
            <canvas ref={canvasRef} className="film-canvas" role="img" aria-label="Purple flowers dissolving into a crystal Veloura perfume bottle" />
          </div>

          {!ready && (
            <div className="film-loader" aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.max(0.04, loadRatio)})` }} />
            </div>
          )}

          <h1 className="sr-only">Veloura — The Art of Rare Fragrance</h1>

          <div className="film-scrollcue" ref={cue}>
            <span>Scroll to begin</span>
            <i className="arrow-chevron" />
          </div>

          <p className="film-caption film-caption--a" ref={capA}>
            <em>Born in a garden</em>
            at the edge of dusk
          </p>
          <p className="film-caption film-caption--b" ref={capB}>
            <em>Petals take form</em>
            and turn to crystal
          </p>
          <p className="film-caption film-caption--c" ref={capC}>
            <em>One bottle</em>
            one rare violet
          </p>

          <div className="film-finale" ref={finale}>
            <p className="hero-eyebrow">The Veloura Collection — 2026</p>
            <p className="hero-title">The Art of <em>Rare Fragrance</em></p>
            <p className="hero-sub">
              Four singular expressions of femininity, each crafted from the world's most precious botanicals.
              <span className="hero-sub-more"> Wear VELOURA as you wear confidence — effortlessly.</span>
            </p>
            <button className="hero-cta" onClick={scrollToProducts}>
              Explore the Collection
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

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
