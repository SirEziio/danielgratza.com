"use client";

import { useEffect, useRef } from "react";

/**
 * The flashlight: a warm lamplight follows the cursor with a gentle lag,
 * and inside its halo the room's geo grid — almost invisible in the dark —
 * is revealed in ember. The bright layer is a small moving element whose
 * background-position is counter-shifted so its grid stays registered
 * with the dim grid underneath; only a ~560px circle ever repaints,
 * everything else is composited transform.
 *
 * Decorative (aria-hidden). On touch devices the light drifts on its own;
 * with prefers-reduced-motion everything stays static.
 */

const SPOT = 560;

export default function JournalBackdrop() {
  const spotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spot = spotRef.current;
    const glow = glowRef.current;
    if (!spot || !glow) return;

    spot.classList.add("has-pointer");
    glow.classList.add("has-pointer");

    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.3;
    let cx = x;
    let cy = y;
    let raf = 0;

    const apply = () => {
      // the light lags the hand a little, like a swinging lamp
      cx += (x - cx) * 0.13;
      cy += (y - cy) * 0.13;
      const tx = cx - SPOT / 2;
      const ty = cy - SPOT / 2;
      spot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      spot.style.backgroundPosition = `${-tx}px ${-ty}px`;
      glow.style.transform = `translate3d(${cx - 400}px, ${cy - 400}px, 0)`;
      if (Math.abs(x - cx) + Math.abs(y - cy) > 0.5) {
        raf = requestAnimationFrame(apply);
      } else {
        raf = 0;
      }
    };

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(apply);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="journal-backdrop" aria-hidden>
      <div className="journal-bd-grid" />
      <div ref={spotRef} className="journal-bd-spot" />
      <div ref={glowRef} className="journal-bd-glow" />
    </div>
  );
}
