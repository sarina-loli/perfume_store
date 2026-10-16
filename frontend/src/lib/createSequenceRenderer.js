import { FRAME_ASPECT, SEQUENCE } from "../config/sequence";

const clamp01 = (n) => Math.min(1, Math.max(0, n));

/**
 * Drives the canvas from the scroll position. This is deliberately plain
 * JavaScript, not React state: scrolling and drawing happen outside React's
 * render cycle, so the scroll animation never causes a component re-render.
 *
 *   scroll position -> target progress (0..1)
 *   target --(exponential easing, per frame)--> current progress
 *   current * (frameCount - 1) -> fractional frame index
 *   two neighbouring frames are cross-faded by the fractional part,
 *   so motion is continuous and never snaps from frame to frame.
 *
 * The loop only runs while something is changing; it stops when settled.
 */
export default function createSequenceRenderer({ container, stage, canvas, store }) {
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const startedAt = performance.now();

  let range = 1; // scrollable distance while pinned, in px
  let target = 0;
  let current = 0;
  let phase = "";
  let rafId = 0;
  let lastTime = 0;
  let destroyed = false;

  function measure() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(stage.clientWidth * dpr));
    const height = Math.max(1, Math.round(stage.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; // resizing resets context state
      canvas.height = height;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    range = Math.max(1, container.offsetHeight - stage.offsetHeight);
    readScroll();
    schedule();
  }

  function readScroll() {
    target = clamp01(-container.getBoundingClientRect().top / range);
  }

  function drawFrame(frame, x, y, w, h, alpha) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(frame, x, y, w, h);
  }

  function draw() {
    const { frames, count } = store;
    const position = current * (count - 1);
    const lower = store.lowerLoaded(Math.floor(position));
    const upper = store.upperLoaded(Math.ceil(position));
    if (lower < 0 && upper < 0) return; // nothing decoded yet

    // Contain-fit: the whole frame is always visible, never cropped or stretched.
    const cw = canvas.width;
    const ch = canvas.height;
    // Use the frame's own aspect so portrait (mobile) frames are not squashed to 16:9.
    const ref = frames[lower >= 0 ? lower : upper];
    const aspect = ref.width && ref.height ? ref.width / ref.height : FRAME_ASPECT;
    const w = Math.min(cw, ch * aspect);
    const h = w / aspect;
    const x = Math.round((cw - w) / 2);
    const y = Math.round((ch - h) / 2);

    ctx.clearRect(0, 0, cw, ch);

    // Missing frames are bridged by blending between the nearest loaded ones.
    const a = lower >= 0 ? lower : upper;
    const b = upper >= 0 ? upper : lower;
    const mix = a === b ? 0 : clamp01((position - a) / (b - a));

    drawFrame(frames[a], x, y, w, h, 1);
    if (mix > 0.002) drawFrame(frames[b], x, y, w, h, mix);
    ctx.globalAlpha = 1;
  }

  function updatePhase() {
    const next =
      current < SEQUENCE.introEnd ? "intro" : current > SEQUENCE.outroStart ? "outro" : "mid";
    if (next !== phase) {
      phase = next;
      stage.dataset.phase = next;
    }
  }

  function tick(now) {
    rafId = 0;
    if (destroyed) return;

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = now;

    const diff = target - current;
    if (reducedMotion.matches || Math.abs(diff) < 0.00005) {
      current = target;
    } else {
      current += diff * (1 - Math.exp(-dt / SEQUENCE.smoothingSeconds));
    }

    draw();
    updatePhase();

    if (current !== target) schedule();
    else lastTime = 0; // settled: stop the loop until the next event
  }

  function schedule() {
    if (!rafId && !destroyed) rafId = requestAnimationFrame(tick);
  }

  function onScroll() {
    readScroll();
    // Browsers restore scroll position just after load; snap instead of easing from 0.
    if (performance.now() - startedAt < 600) current = target;
    schedule();
  }

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(stage);
  window.addEventListener("scroll", onScroll, { passive: true });

  measure();
  current = target; // start at the current scroll position, not at frame 0
  updatePhase();

  return {
    /** Call when a frame finishes decoding so it can be drawn right away. */
    invalidate: schedule,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    },
  };
}
