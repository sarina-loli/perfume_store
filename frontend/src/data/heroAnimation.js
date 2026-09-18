// ── Hero animation data: the "VICTORIA" mist letters and the spray particles ──
// Pulled out of App.jsx because it's pure static data, not UI logic.

export const MIST_LETTERS = 'VICTORIA'.split('')

/* ── Spray particles — deterministic, cone-shaped expanding rightward ── */
export const SPRAY_PARTICLES = [
  /* close layer — dense, opaque */
  { id:  0, tx:  90, ty:  -6, size: 10, delay: 0.00, dur: 2.0, op: 0.72 },
  { id:  1, tx: 120, ty:  14, size:  8, delay: 0.04, dur: 1.9, op: 0.68 },
  { id:  2, tx: 100, ty: -20, size:  7, delay: 0.08, dur: 2.1, op: 0.65 },
  { id:  3, tx: 140, ty:   5, size: 12, delay: 0.03, dur: 2.2, op: 0.60 },
  { id:  4, tx:  80, ty:  22, size:  9, delay: 0.10, dur: 1.8, op: 0.70 },
  /* mid layer — spreading */
  { id:  5, tx: 190, ty: -10, size: 18, delay: 0.06, dur: 2.4, op: 0.50 },
  { id:  6, tx: 220, ty:  30, size: 16, delay: 0.12, dur: 2.3, op: 0.48 },
  { id:  7, tx: 200, ty: -38, size: 14, delay: 0.15, dur: 2.5, op: 0.45 },
  { id:  8, tx: 260, ty:  18, size: 22, delay: 0.09, dur: 2.6, op: 0.42 },
  { id:  9, tx: 170, ty:  45, size: 13, delay: 0.18, dur: 2.2, op: 0.52 },
  { id: 10, tx: 240, ty: -50, size: 17, delay: 0.14, dur: 2.7, op: 0.40 },
  /* far layer — large, diffuse */
  { id: 11, tx: 330, ty:   8, size: 32, delay: 0.16, dur: 3.0, op: 0.30 },
  { id: 12, tx: 370, ty:  55, size: 28, delay: 0.20, dur: 3.2, op: 0.27 },
  { id: 13, tx: 350, ty: -62, size: 26, delay: 0.22, dur: 3.1, op: 0.28 },
  { id: 14, tx: 420, ty:  25, size: 38, delay: 0.25, dur: 3.4, op: 0.22 },
  { id: 15, tx: 400, ty: -38, size: 30, delay: 0.28, dur: 3.3, op: 0.25 },
  { id: 16, tx: 460, ty:  70, size: 44, delay: 0.32, dur: 3.6, op: 0.18 },
  /* outermost wisps */
  { id: 17, tx: 500, ty:  15, size: 52, delay: 0.35, dur: 3.8, op: 0.14 },
  { id: 18, tx: 480, ty: -80, size: 40, delay: 0.30, dur: 3.5, op: 0.16 },
  { id: 19, tx: 540, ty:  45, size: 60, delay: 0.40, dur: 4.2, op: 0.10 },
]
