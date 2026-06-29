"use client";

import { useEffect, useRef } from "react";

const SPACING       = 26;
const FONT_SIZE     = 11;
const BASE_SPEED    = 18;    // px / second
const SLOW_RADIUS   = 140;   // px
const MIN_SPEED_MUL = 0.03;
const GLITCH_COLOR_CHANCE = 0.018; // ~1.8% chance per cell per frame to flash ball color

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&?><÷×±≠∑∂∫∞§";

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Colors hardcoded from globals.css — no CSS-var parsing needed
const LIGHT_INK  = "36,36,36";
const DARK_INK   = "225,223,216";
const LIGHT_BALL = "197,209,0";   // --ball light: #c5d100
const DARK_BALL  = "59,53,217";   // --ball dark:  #3b35d9

interface Cell {
  char: string;
  opacity: number;
  swapAt: number;
  swapInterval: number;
}

interface Column {
  x: number;
  speed: number;
  offset: number;
  cells: Cell[];
}

export default function DotGrid({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let cw = 0, ch = 0;
    let elapsed = 0;
    let lastTime = performance.now();

    let columns: Column[] = [];

    const makeCell = (t: number): Cell => ({
      char: randomGlyph(),
      opacity: 0.06 + Math.random() * 0.18,
      swapInterval: 0.35 + Math.random() * 2.2,
      swapAt: t + Math.random() * 2.0,
    });

    const buildColumns = (t: number) => {
      columns = [];
      for (let x = SPACING / 2; x < cw; x += SPACING) {
        const numCells = Math.ceil(ch / SPACING) + 2;
        columns.push({
          x,
          speed: BASE_SPEED * (0.45 + Math.random() * 1.1),
          offset: Math.random() * ch,
          cells: Array.from({ length: numCells }, () => makeCell(t)),
        });
      }
    };

    const resize = () => {
      // Use offsetWidth/offsetHeight — reliable even when canvas is off-screen
      // (getBoundingClientRect returns wrong values for elements in scrolled snap containers on Chrome)
      cw = canvas.offsetWidth;
      ch = canvas.offsetHeight;
      if (!cw || !ch) return; // not yet laid out
      canvas.width  = Math.round(cw * devicePixelRatio);
      canvas.height = Math.round(ch * devicePixelRatio);
      buildColumns(elapsed);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;
      elapsed += dt;

      // Read theme on every frame — cheap class check, ensures dark mode works
      const isDark = document.documentElement.classList.contains("dark");
      const inkColor  = isDark ? DARK_INK  : LIGHT_INK;
      const ballColor = isDark ? DARK_BALL : LIGHT_BALL;

      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const { x: mx } = mouse.current;
      const wrap = ch + SPACING * 2;

      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const col of columns) {
        // Mouse slowdown
        const horizDist = Math.abs(col.x - mx);
        const influence = Math.max(0, 1 - horizDist / SLOW_RADIUS);
        const speedMul  = 1 - influence * (1 - MIN_SPEED_MUL);

        col.offset = (col.offset + col.speed * dt * speedMul) % wrap;

        for (let j = 0; j < col.cells.length; j++) {
          const cell = col.cells[j];

          // Glitch: swap character on schedule
          if (elapsed >= cell.swapAt) {
            cell.char = randomGlyph();
            cell.swapAt = elapsed + cell.swapInterval;
            if (Math.random() < 0.12) {
              cell.swapInterval = 0.05 + Math.random() * 0.3; // burst mode
            } else {
              cell.swapInterval = 0.35 + Math.random() * 2.2;
            }
          }

          const fy = ((j * SPACING - col.offset) % wrap + wrap) % wrap;
          if (fy > ch + SPACING) continue;

          // Rare: flash in ball color
          const useBallColor = Math.random() < GLITCH_COLOR_CHANCE;
          if (useBallColor) {
            ctx.globalAlpha = Math.min(cell.opacity * 2.2, 0.65);
            ctx.fillStyle   = `rgb(${ballColor})`;
          } else {
            ctx.globalAlpha = cell.opacity;
            ctx.fillStyle   = `rgb(${inkColor})`;
          }

          ctx.fillText(cell.char, col.x, fy);
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    // ResizeObserver catches layout changes (e.g. section becoming visible in snap container)
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
