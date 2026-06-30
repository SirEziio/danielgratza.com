"use client";

import { useEffect, useRef } from "react";

/**
 * Viewport-level cinematic overlay — two fixed, pointer-events:none layers:
 *  1. Animated film grain   — half-res canvas at 20 fps, soft-light blend
 *  2. Chromatic aberration  — RGB edge fringe via radial gradient divs
 *
 * Kept separate from layout content so fixed elements (nav, menu) are unaffected.
 */
export default function ViewportEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const lastRef   = useRef<number>(0);
  const INTERVAL  = 1000 / 20; // 20 fps — filmic, not digital

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Half-resolution → CSS upscale gives a softer, more organic grain texture
    const resize = () => {
      canvas.width  = Math.ceil(window.innerWidth  / 2);
      canvas.height = Math.ceil(window.innerHeight / 2);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastRef.current < INTERVAL) return;
      lastRef.current = now;

      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const v  = (Math.random() * 255) | 0;
        d[i]     = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = (Math.random() * 30) | 0; // 0–30 per-pixel alpha
      }
      ctx.putImageData(imageData, 0, 0);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* ── 1. Film grain ─────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9998,
          mixBlendMode: "soft-light",
          opacity: 0.5,
        }}
      />

      {/* ── 2. Chromatic aberration — RGB fringe at viewport edges */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9997,
          background: [
            "radial-gradient(ellipse 45% 100% at -4% 50%, rgba(255,20,60,0.055) 0%, transparent 100%)",
            "radial-gradient(ellipse 45% 100% at 104% 50%, rgba(20,60,255,0.055) 0%, transparent 100%)",
            "radial-gradient(ellipse 100% 25% at 50% -2%, rgba(20,220,80,0.018) 0%, transparent 100%)",
          ].join(", "),
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
