"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

const CELL = 56; // px per grid cell

interface Cell {
  fill: number;   // 0–1 current fill
  target: number; // 0–1 target fill
  trail: number;  // 0–1 fading trail
}

export default function GridBackground({
  forceDark,
  forceLight,
  interactive = true,
}: { forceDark?: boolean; forceLight?: boolean; interactive?: boolean } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<Cell[][]>([]);
  const breathRef = useRef(0);
  const rafRef = useRef<number>(0);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const initCells = useCallback((cols: number, rows: number) => {
    cellsRef.current = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        fill: 0,
        target: 0,
        trail: 0,
      }))
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0, rows = 0;
    let W = 0, H = 0, dpr = 1;
    let mask: number[] = []; // per-cell radial fade, static per layout

    /* The grid lines never move — bake them (with their radial fade) into an
       offscreen layer once per layout/theme, then composite it each frame
       with a single drawImage. Stroking ~1300 cells per frame was the cost. */
    let lines: HTMLCanvasElement | null = null;
    let linesDark: boolean | null = null;

    const buildLines = (isDark: boolean) => {
      lines = lines ?? document.createElement("canvas");
      lines.width = Math.round(W * dpr);
      lines.height = Math.round(H * dpr);
      const lctx = lines.getContext("2d");
      if (!lctx) return;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.lineWidth = 0.5;
      const base = isDark ? "240,236,228" : "36,36,36";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL;
          const y = r * CELL;
          lctx.strokeStyle = `rgba(${base},${mask[r * cols + c]})`;
          lctx.beginPath();
          lctx.moveTo(x + CELL, y);
          lctx.lineTo(x + CELL, y + CELL);
          lctx.moveTo(x, y + CELL);
          lctx.lineTo(x + CELL, y + CELL);
          lctx.stroke();
        }
      }
      linesDark = isDark;
    };

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      /* Cap the backing store on hi-DPI/4K displays (~4.5MP is plenty) */
      dpr = Math.max(1, Math.min(devicePixelRatio || 1, Math.sqrt(4.5e6 / Math.max(1, W * H))));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
      initCells(cols, rows);

      mask = new Array(rows * cols);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = (((c + 0.5) * CELL) / W - 0.5) * 2;
          const dy = (((r + 0.5) * CELL) / H - 0.5) * 2;
          const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));
          mask[r * cols + c] = 1 - dist * 0.75;
        }
      }
      linesDark = null; // force line layer rebuild
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Mouse hover
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const col = Math.floor(mx / CELL);
      const row = Math.floor(my / CELL);
      if (
        cellsRef.current[row] &&
        cellsRef.current[row][col] !== undefined
      ) {
        const cell = cellsRef.current[row][col];
        if (cell.target < 1) {
          // leave a small trail on cells we're leaving
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const prev = cellsRef.current[r][c];
              if (prev.target > 0 && !(r === row && c === col)) {
                prev.trail = prev.fill;
                prev.target = 0;
              }
            }
          }
          cell.target = 1;
        }
      }
    };

    if (interactive) canvas.addEventListener("mousemove", handleMouse);

    // Animate
    const draw = () => {
      breathRef.current += 0.012;
      const breathVal = (Math.sin(breathRef.current) + 1) / 2; // 0–1

      ctx.clearRect(0, 0, W, H);

      const isDark = forceLight ? false : (forceDark || themeRef.current === "dark");
      if (!lines || linesDark !== isDark) buildLines(isDark);

      // Hover fills — only the handful of active cells cost anything
      if (interactive) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cell = cellsRef.current[r]?.[c];
            if (!cell) continue;
            cell.fill += (cell.target - cell.fill) * 0.06;
            cell.trail *= 0.94;
            const fillAmt = Math.max(cell.fill, cell.trail * 0.35);
            if (fillAmt > 0.005) {
              const radialMask = mask[r * cols + c];
              ctx.fillStyle = isDark
                ? `rgba(197,209,0,${fillAmt * 0.18 * radialMask})`
                : `rgba(36,36,36,${fillAmt * 0.08 * radialMask})`;
              ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
            }
          }
        }
      }

      // Grid lines — breathing applied as one global alpha over the baked layer
      if (lines) {
        ctx.globalAlpha = 0.005 + breathVal * 0.135;
        ctx.drawImage(lines, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      if (running) rafRef.current = requestAnimationFrame(draw);
    };

    /* Pause when this section is offscreen — several instances share pages */
    let running = true;
    const io = new IntersectionObserver(([entry]) => {
      const vis = entry.isIntersecting;
      if (vis && !running) {
        running = true;
        rafRef.current = requestAnimationFrame(draw);
      } else if (!vis && running) {
        running = false;
        cancelAnimationFrame(rafRef.current);
      }
    });
    io.observe(canvas);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", handleMouse);
      io.disconnect();
      ro.disconnect();
    };
  }, [initCells, forceDark, forceLight, interactive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: interactive ? "auto" : "none",
      }}
    />
  );
}
