import { FRAME_ASPECT, SEQUENCE, frameUrl } from "../config/sequence";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Order in which frames are fetched: first, last, then progressively finer
 * strides (every 16th, 8th, 4th, 2nd, then the rest). The sequence is
 * scrubbable almost immediately and fills in detail while the page is used.
 */
export function buildLoadOrder(count) {
  const seen = new Set();
  const order = [];
  const add = (i) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };
  add(0);
  add(count - 1);
  for (let stride = 16; stride >= 1; stride /= 2) {
    for (let i = 0; i < count; i += stride) add(i);
  }
  return order;
}

/**
 * Width (px) frames need to be decoded at for the current screen, rounded up
 * to a 160px bucket so small resizes do not trigger re-decoding.
 * Returns 0 when the native width is needed (meaning "do not resize").
 */
export function neededDecodeWidth() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = Math.min(window.innerWidth, window.innerHeight * FRAME_ASPECT);
  const bucketed = Math.ceil((displayWidth * dpr) / 160) * 160;
  const width = Math.min(bucketed, SEQUENCE.maxDecodeWidth || Infinity);
  return width >= SEQUENCE.nativeWidth ? 0 : Math.max(width, 480);
}

/**
 * Downloads and decodes the frames. Frames are kept as decoded ImageBitmaps
 * (or decoded <img> elements as a fallback) so drawing never waits on decode.
 * The compressed blobs are retained so frames can be re-decoded at a larger
 * size if the window grows, without downloading them again.
 */
export default class FrameStore {
  constructor({ decodeWidth = 0, onFrame, onProgress, onDone } = {}) {
    this.count = SEQUENCE.frameCount;
    this.frames = new Array(this.count).fill(null);
    this.blobs = new Array(this.count).fill(null);
    this.decodeWidth = decodeWidth;
    this.onFrame = onFrame;
    this.onProgress = onProgress;
    this.onDone = onDone;

    this.loaded = 0;
    this.failed = 0;
    this.aborted = false;
    this.controller = new AbortController();
    this.redecodeToken = 0;
    this.order = buildLoadOrder(this.count);
  }

  start() {
    let cursor = 0;
    const worker = async () => {
      while (!this.aborted && cursor < this.order.length) {
        await this.loadFrame(this.order[cursor++]);
      }
    };
    Promise.all(Array.from({ length: SEQUENCE.concurrency }, worker)).then(() => {
      if (!this.aborted) this.onDone?.({ loaded: this.loaded, failed: this.failed });
    });
  }

  destroy() {
    this.aborted = true;
    this.controller.abort();
    this.frames.forEach((frame) => frame?.close?.());
    this.frames.fill(null);
    this.blobs.fill(null);
  }

  /** Nearest loaded frame at or below `index`, or -1. */
  lowerLoaded(index) {
    for (let i = Math.min(index, this.count - 1); i >= 0; i--) if (this.frames[i]) return i;
    return -1;
  }

  /** Nearest loaded frame at or above `index`, or -1. */
  upperLoaded(index) {
    for (let i = Math.max(index, 0); i < this.count; i++) if (this.frames[i]) return i;
    return -1;
  }

  /** Re-decode every loaded frame larger if the screen now needs more pixels. */
  async requestDecodeWidth(width) {
    if (this.aborted || this.decodeWidth === 0) return;
    if (width !== 0 && width <= this.decodeWidth) return;

    this.decodeWidth = width;
    const token = ++this.redecodeToken;
    for (const i of this.order) {
      if (this.aborted || token !== this.redecodeToken) return;
      const blob = this.blobs[i];
      if (!blob) continue;
      try {
        const next = await this.decode(blob);
        if (this.aborted || token !== this.redecodeToken) {
          next.close?.();
          return;
        }
        const previous = this.frames[i];
        this.frames[i] = next;
        previous?.close?.();
        this.onFrame?.(i);
      } catch {
        /* keep the existing, smaller bitmap */
      }
    }
  }

  async loadFrame(index) {
    try {
      const blob = await this.fetchBlob(index);
      if (this.aborted) return;
      this.blobs[index] = blob;
      const frame = await this.decode(blob);
      if (this.aborted) {
        frame.close?.();
        return;
      }
      this.frames[index] = frame;
      this.loaded++;
      this.onFrame?.(index);
    } catch (error) {
      if (this.aborted) return;
      this.failed++;
      console.warn(`Victoria hero: frame ${index + 1} could not be loaded.`, error);
    } finally {
      if (!this.aborted) {
        this.onProgress?.({ settled: this.loaded + this.failed, total: this.count });
      }
    }
  }

  async fetchBlob(index) {
    const url = frameUrl(index);
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch(url, { signal: this.controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.blob();
      } catch (error) {
        if (this.aborted || attempt >= 1) throw error;
        await wait(400); // one retry for transient network errors
      }
    }
  }

  async decode(blob) {
    if (typeof createImageBitmap === "function") {
      try {
        const options = this.decodeWidth
          ? { resizeWidth: this.decodeWidth, resizeQuality: "high" }
          : undefined;
        return await createImageBitmap(blob, options);
      } catch {
        /* fall through to <img> decoding */
      }
    }
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = objectUrl;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
