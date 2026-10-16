import Footer from '../components/Footer'

/* ════════════════════════════════════
   ABOUT
════════════════════════════════════ */
export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <img
          src="https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?w=1400&h=600&fit=crop&auto=format"
          alt="Victoria atelier"
        />
        <div className="about-hero-overlay">
          <h1>The Victoria Story</h1>
          <p>Perfumery as a Fine Art</p>
        </div>
      </div>

      <div className="about-inner">
        <div className="about-block">
          <p className="about-block-label">Our Origin</p>
          <h2>Born of a singular obsession with beauty</h2>
          <p>
            VICTORIA was founded in Paris in 2019 by master perfumer Élise Marchand, whose thirty years among the jasmine fields of Grasse gave her an intimate understanding of what makes a fragrance transcend — not just the notes, but the narrative they carry on the skin.
          </p>
          <p>
            The house was built around a single conviction: that great perfume is inseparable from great storytelling. Each VICTORIA fragrance is a chapter — composed with the precision of poetry and the patience of a craftsperson who refuses to rush something rare.
          </p>
        </div>

        <div className="about-block">
          <p className="about-block-label">Our Philosophy</p>
          <h2>No shortcuts. No compromises.</h2>
          <p>
            We source raw materials exclusively from their regions of origin — Bulgarian roses harvested at dawn, Madagascan vanilla cured for eighteen months, Hindi oud aged in traditional distilleries. Each ingredient is chosen because there is simply no substitute for the real thing.
          </p>
          <p>
            Our fragrances are never diluted to mass-market expectations. Every bottle holds a full concentration, a full expression — because you deserve nothing less.
          </p>
        </div>

        <div className="about-values">
          <div className="about-value">
            <h4>Provenance</h4>
            <p>Every ingredient traced to its single origin, selected for purity above all else.</p>
          </div>
          <div className="about-value">
            <h4>Longevity</h4>
            <p>High-concentration formulas that evolve beautifully over twelve or more hours on skin.</p>
          </div>
          <div className="about-value">
            <h4>Restraint</h4>
            <p>Four fragrances only. Each one irreplaceable. No seasonal releases, no compromise.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
