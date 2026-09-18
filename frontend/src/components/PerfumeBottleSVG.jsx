/* ── SVG violet perfume bottle ── */
export default function PerfumeBottleSVG() {
  return (
    <svg
      viewBox="0 0 220 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hero-bottle-svg"
      aria-label="Victoria violet perfume bottle"
    >
      <defs>
        {/* Body glass gradient — violet */}
        <linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#5B3F9E" />
          <stop offset="22%"  stopColor="#7A5CC0" />
          <stop offset="48%"  stopColor="#9B7FD8" />
          <stop offset="72%"  stopColor="#8268C6" />
          <stop offset="100%" stopColor="#4E3490" />
        </linearGradient>
        {/* Cap gradient — deep violet / near-black */}
        <linearGradient id="capG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#3A2570" />
          <stop offset="100%" stopColor="#1E1040" />
        </linearGradient>
        {/* Neck gradient */}
        <linearGradient id="neckG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#6A4FB8" />
          <stop offset="50%"  stopColor="#8B72CE" />
          <stop offset="100%" stopColor="#5A40A8" />
        </linearGradient>
        {/* Glass highlight — soft white streak on left side */}
        <linearGradient id="highlightG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Nozzle gradient */}
        <linearGradient id="nozzleG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#2E1A58" />
          <stop offset="100%" stopColor="#1A0E38" />
        </linearGradient>
        {/* Drop shadow filter */}
        <filter id="bottleShadow" x="-20%" y="-5%" width="140%" height="115%">
          <feDropShadow dx="0" dy="20" stdDeviation="14" floodColor="rgba(60,30,120,0.35)" />
        </filter>
      </defs>

      {/* ── Bottom floor shadow ── */}
      <ellipse cx="110" cy="485" rx="70" ry="9" fill="rgba(80,40,160,0.18)" />

      {/* ── Body ── */}
      {/* Shoulder left */}
      <path d="M38,148 Q38,118 72,105 L88,102 L88,148 Z" fill="url(#bodyG)" />
      {/* Shoulder right */}
      <path d="M182,148 Q182,118 148,105 L132,102 L132,148 Z" fill="url(#bodyG)" />
      {/* Main body rect */}
      <rect x="38" y="148" width="144" height="316" rx="5" fill="url(#bodyG)" filter="url(#bottleShadow)" />
      {/* Glass sheen on body */}
      <rect x="38" y="148" width="144" height="316" rx="5" fill="url(#highlightG)" />
      {/* Left edge inner highlight */}
      <rect x="52" y="156" width="14" height="298" rx="3" fill="rgba(255,255,255,0.11)" />
      {/* Right edge inner shadow */}
      <rect x="162" y="156" width="10" height="298" rx="2" fill="rgba(0,0,0,0.12)" />

      {/* ── Label area ── */}
      <rect x="52" y="222" width="116" height="170" rx="2"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.6"
      />
      {/* Decorative thin rules */}
      <line x1="66" y1="242" x2="154" y2="242" stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" />
      <line x1="66" y1="368" x2="154" y2="368" stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" />
      {/* Brand name */}
      <text x="110" y="296"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="4"
        fill="rgba(255,255,255,0.92)"
      >VICTORIA</text>
      {/* Sub-text */}
      <text x="110" y="318"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="7"
        fontWeight="400"
        letterSpacing="2.5"
        fill="rgba(255,255,255,0.50)"
      >EAU DE PARFUM</text>
      {/* Small ornament */}
      <text x="110" y="270"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="9"
        fill="rgba(255,255,255,0.35)"
        letterSpacing="1"
      >✦</text>

      {/* ── Neck ── */}
      <rect x="74" y="72" width="72" height="33" rx="2" fill="url(#neckG)" />
      {/* Neck highlight */}
      <rect x="80" y="72" width="12" height="33" fill="rgba(255,255,255,0.10)" />

      {/* ── Cap / Actuator block ── */}
      <rect x="62" y="18" width="96" height="56" rx="4" fill="url(#capG)" />
      {/* Cap top highlight */}
      <rect x="62" y="18" width="96" height="7" rx="4" fill="rgba(255,255,255,0.10)" />
      {/* Cap right highlight line */}
      <rect x="152" y="22" width="4" height="48" rx="2" fill="rgba(255,255,255,0.06)" />

      {/* ── Pump actuator button (top of cap) ── */}
      <rect x="99" y="6" width="22" height="16" rx="5" fill="#150C2E" />
      <rect x="99" y="6" width="22" height="5" rx="5" fill="rgba(255,255,255,0.08)" />

      {/* ── Nozzle tube — horizontal, exits right side of cap ── */}
      {/* Main tube */}
      <rect x="158" y="32" width="52" height="11" rx="3.5" fill="url(#nozzleG)" />
      {/* Tube top highlight */}
      <rect x="158" y="32" width="52" height="3" rx="2" fill="rgba(255,255,255,0.12)" />
      {/* Tube end cap (the exit opening) */}
      <rect x="208" y="30" width="5" height="15" rx="1.5" fill="#0F081E" />
      {/* Tiny opening hole */}
      <rect x="210" y="35" width="2" height="5" rx="1" fill="#1A0E38" />

      {/* ── Bottom base plate ── */}
      <rect x="34" y="456" width="152" height="10" rx="3" fill="#3D2580" opacity="0.55" />
    </svg>
  )
}
