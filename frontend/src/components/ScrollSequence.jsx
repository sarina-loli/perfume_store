import { useEffect, useRef, useState } from "react";
import { SEQUENCE } from "../config/sequence";
import FrameStore, { neededDecodeWidth } from "../lib/FrameStore";
import createSequenceRenderer from "../lib/createSequenceRenderer";
import "../styles/sequence.css";

/**
 * A tall scroll container with a pinned (position: sticky) stage that holds the
 * canvas. `children` render as an overlay on the stage and can react to the
 * stage's `data-phase` attribute ("intro" | "mid" | "outro") via CSS.
 *
 * When `background` is set, the stage paints the shared blurred background
 * (the --site-bg-image variable; see styles/background.css) behind the canvas,
 * with the same dark overlay as the rest of the site.
 *
 * React only renders this component a few times (initial, loaded, error).
 * Scroll handling, easing and drawing all happen in createSequenceRenderer.
 */
export default function ScrollSequence({ label, background, children }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(null);
  const barRef = useRef(null);
  const percentRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let renderer = null;

    const store = new FrameStore({
      decodeWidth: neededDecodeWidth(),
      onFrame: () => renderer?.invalidate(),
      onProgress: ({ settled, total }) => {
        const ratio = settled / total;
        if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
        if (percentRef.current) percentRef.current.textContent = `${Math.round(ratio * 100)}%`;
        progressRef.current?.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
      },
      onDone: ({ loaded }) => setStatus(loaded === 0 ? "error" : "ready"),
    });

    renderer = createSequenceRenderer({
      container: containerRef.current,
      stage: stageRef.current,
      canvas: canvasRef.current,
      store,
    });
    store.start();

    // If the window grows enough to need sharper frames, re-decode in the background.
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => store.requestDecodeWidth(neededDecodeWidth()), 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      renderer.destroy();
      store.destroy();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="sequence"
      style={{ "--pin": `${SEQUENCE.pinVh}vh` }}
    >
      <div ref={stageRef} className="sequence__stage" data-phase="intro">
        {background && (
          <div className="sequence__bg" aria-hidden="true">
            <div className="sequence__bg-image" />
          </div>
        )}

        <canvas ref={canvasRef} className="sequence__canvas" role="img" aria-label={label} />

        {children}

        <div
          ref={progressRef}
          className="sequence__progress"
          data-state={status}
          role="progressbar"
          aria-label="Loading animation frames"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
        >
          <span ref={percentRef} className="sequence__percent">
            0%
          </span>
          <span className="sequence__track">
            <span ref={barRef} className="sequence__bar" />
          </span>
        </div>

        {status === "error" && (
          <p className="sequence__error" role="alert">
            The animation frames could not be loaded. Check your connection and reload the page.
          </p>
        )}
      </div>
    </section>
  );
}
