"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

// Ball is ~40% of the smaller viewport dimension
const SIZE = () => Math.min(window.innerWidth, window.innerHeight) * 0.52;

export default function BouncingBall() {
  const ballRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const ball = ballRef.current;
    const container = containerRef.current;
    if (!ball || !container) return;

    const size = SIZE();
    ball.style.width = `${size}px`;
    ball.style.height = `${size}px`;

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    const state = {
      x: size * 0.1,            // start near left edge
      y: h * 0.3,               // start mid-height
      vx: 1.4,
      vy: 0.9,
      raf: 0,
    };

    const tick = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const r = ball.offsetWidth; // diameter used as bounding size

      state.x += state.vx;
      state.y += state.vy;

      if (state.x < 0) {
        state.x = 0;
        state.vx = Math.abs(state.vx);
      } else if (state.x + r > cw) {
        state.x = cw - r;
        state.vx = -Math.abs(state.vx);
      }

      if (state.y < 0) {
        state.y = 0;
        state.vy = Math.abs(state.vy);
      } else if (state.y + r > ch) {
        state.y = ch - r;
        state.vy = -Math.abs(state.vy);
      }

      ball.style.transform = `translate(${state.x}px, ${state.y}px)`;

      // Update color from CSS var in real time
      ball.style.background = getComputedStyle(document.documentElement)
        .getPropertyValue("--ball").trim();

      state.raf = requestAnimationFrame(tick);
    };

    state.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(state.raf);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        ref={ballRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          borderRadius: "50%",
          background: "var(--ball)",
          willChange: "transform",
          transition: "background 0.35s ease",
        }}
      />
    </div>
  );
}
