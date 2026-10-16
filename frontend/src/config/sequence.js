// Everything that describes the hero image sequence lives here.
// (Structure and logic come from the scroll-animation kit; only the values below
// are specific to the Victoria frames.)
//
// Frames are served from /public/framess as frame-0001.png ... frame-0120.png
// (1-based, zero-padded). They are portrait 1080 x 1920.

export const SEQUENCE = {
  frameCount: 120,
  nativeWidth: 1080,
  nativeHeight: 1920,

  // How far the canvas stays pinned, in viewport heights of scrolling.
  pinVh: 400,

  // Scroll-progress thresholds (0..1) at which overlay copy swaps.
  introEnd: 0.08,
  outroStart: 0.92,

  // Time constant (seconds) of the exponential easing between the scroll
  // position and the displayed position. Smaller = snappier.
  smoothingSeconds: 0.12,

  // Parallel frame downloads.
  concurrency: 4,

  // Upper limit (px) for the width frames are decoded at. A decoded frame costs
  // width * height * 4 bytes of memory and all 120 stay decoded, so retina
  // screens would otherwise decode every frame at the full 1080 x 1920
  // (~1 GB). 720px keeps the animation sharp at roughly 440 MB worst case.
  maxDecodeWidth: 720,
};

export const frameUrl = (index) => {
  if (window.innerWidth >= 1000) {
    return `${import.meta.env.BASE_URL}frames/frame-${String(index + 1).padStart(4, "0")}.png`;
  }
  if (window.innerWidth < 1000) {
    return `${import.meta.env.BASE_URL}framess/frame-${String(index + 1).padStart(4, "0")}.png`;
  }
  
};
// The final frame doubles as the blurred hero background.
export const backgroundUrl = frameUrl(SEQUENCE.frameCount - 1);

export const FRAME_ASPECT = SEQUENCE.nativeWidth / SEQUENCE.nativeHeight;
