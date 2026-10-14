import { useEffect } from 'react'

/* ════════════════════════════════════
   useScrollFrames
   Drives a canvas frame-sequence from page scroll.

   - Progress (0→1) is how far the tall "film" section has been scrolled.
   - Progress is eased over time (so wheel notches and touch flicks glide
     instead of stepping), then mapped to a fractional frame position.
   - The two neighbouring frames are cross-faded for the fractional part,
     so slow scrolling is continuous rather than frame-by-frame.
   - Frames load progressively (first, then a coarse pass, then the rest) and
     the nearest decoded frame is always drawn, so scrubbing never shows a hole.
   - The rAF loop only runs while something is moving.
════════════════════════════════════ */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)

export default function useScrollFrames({
  sectionRef,   // tall scroll-track element
  canvasRef,    // <canvas> inside the sticky stage
  frameCount,
  frameUrl,     // (index) => string
  overlays,     // [{ ref, from, to, hold? }] — elements faded by scroll progress
  onLoad,       // (ratio 0→1)
  onReady,      // first frame is on screen
}) {
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: false })
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frames = new Array(frameCount).fill(null)
    let loaded = 0
    let cancelled = false

    /* ── progressive loading ── */
    const order = []
    const seen = new Set()
    const push = (i) => { if (i < frameCount && !seen.has(i)) { seen.add(i); order.push(i) } }
    push(0)
    for (let i = 0; i < frameCount; i += 6) push(i)
    for (let i = 0; i < frameCount; i += 2) push(i)
    for (let i = 0; i < frameCount; i += 1) push(i)
    push(frameCount - 1)

    let cursor = 0
    const loadNext = () => {
      if (cancelled || cursor >= order.length) return
      const idx = order[cursor++]
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (cancelled) return
        const done = () => {
          if (cancelled) return
          frames[idx] = img
          loaded += 1
          onLoad && onLoad(loaded / frameCount)
          lastKey = ''           // force a redraw with the new frame available
          requestTick()
          loadNext()
        }
        // decode() so the first draw doesn't stall on decoding
        img.decode ? img.decode().then(done, done) : done()
      }
      img.onerror = () => { if (!cancelled) loadNext() }
      img.src = frameUrl(idx)
    }
    const CONCURRENCY = 4
    for (let i = 0; i < CONCURRENCY; i++) loadNext()

    const nearest = (i) => {
      if (frames[i]) return frames[i]
      for (let d = 1; d < frameCount; d++) {
        if (i - d >= 0 && frames[i - d]) return frames[i - d]
        if (i + d < frameCount && frames[i + d]) return frames[i + d]
      }
      return null
    }

    /* ── canvas sizing (backing store capped at source resolution) ── */
    let cw = 0
    let ch = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const probe = frames.find(Boolean)
      const maxW = probe ? probe.naturalWidth : 1080
      const w = Math.round(Math.min(rect.width * dpr, maxW))
      const h = Math.round(w * (16 / 9))
      if (w !== cw || h !== ch) {
        cw = w; ch = h
        canvas.width = w
        canvas.height = h
        lastKey = ''
      }
    }

    /* ── progress ── */
    let target = 0
    let current = 0
    let lastKey = ''
    let raf = 0
    let last = 0
    let readyFired = false

    const readTarget = () => {
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      target = total > 0 ? clamp(-rect.top / total) : 0
    }

    const draw = (p) => {
      resize()
      if (!cw) return
      const f = p * (frameCount - 1)
      const i = Math.min(frameCount - 1, Math.floor(f))
      const t = reduceMotion ? 0 : Math.round((f - i) * 20) / 20
      const key = `${i}:${t}:${cw}:${loaded < frameCount ? loaded : 'x'}`
      if (key === lastKey) return
      lastKey = key
      const a = nearest(i)
      if (!a) return
      ctx.globalAlpha = 1
      ctx.drawImage(a, 0, 0, cw, ch)
      if (t > 0 && i + 1 < frameCount) {
        const b = nearest(i + 1)
        if (b && b !== a) {
          ctx.globalAlpha = t
          ctx.drawImage(b, 0, 0, cw, ch)
          ctx.globalAlpha = 1
        }
      }
      if (!readyFired) { readyFired = true; onReady && onReady() }
    }

    const applyOverlays = (p) => {
      if (!overlays) return
      for (const o of overlays) {
        const el = o.ref.current
        if (!el) continue
        const span = o.to - o.from
        const edge = Math.min(0.06, span * 0.3)
        let v
        if (p < o.from) v = 0
        else if (p < o.from + edge) v = smooth((p - o.from) / edge)
        else if (o.hold || p < o.to - edge) v = 1
        else v = 1 - smooth(clamp((p - (o.to - edge)) / edge))
        if (o.hold && p >= o.from) v = smooth(clamp((p - o.from) / Math.max(edge * 2, 0.001)))
        el.style.opacity = v.toFixed(3)
        el.style.transform = `translate3d(0, ${((1 - v) * 18).toFixed(1)}px, 0)`
        el.style.visibility = v < 0.005 ? 'hidden' : 'visible'
        el.style.pointerEvents = v > 0.6 ? 'auto' : 'none'
      }
    }

    const tick = (now) => {
      raf = 0
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      const diff = target - current
      if (reduceMotion || Math.abs(diff) < 0.0004) current = target
      else current += diff * (1 - Math.exp(-dt * 11))
      draw(current)
      applyOverlays(current)
      if (current !== target) requestTick()
      else last = 0
    }
    function requestTick() { if (!raf && !cancelled) raf = requestAnimationFrame(tick) }

    const onScroll = () => { readTarget(); requestTick() }
    const onResize = () => { readTarget(); lastKey = ''; requestTick() }

    readTarget()
    current = target              // land exactly on the right frame (reload / back-nav)
    requestTick()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null
    ro && ro.observe(canvas)

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      ro && ro.disconnect()
      frames.fill(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount])
}
