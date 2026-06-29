"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

const CELL = 56; // px per grid cell

interface Cell {
  fill: number;   // 0–1 current fill
  target: number; // 0–1 target fill
  trail: number;  // 0–1 fading trail
}

export default function GridBackground({ forceDark, forceLight }: { forceDark?: boolean; forceLight?: boolean } = {}) {
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

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cols = Math.ceil(canvas.offsetWidth / CELL) + 1;
      rows = Math.ceil(canvas.offsetHeight / CELL) + 1;
      initCells(cols, rows);
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

    canvas.addEventListener("mousemove", handleMouse);

    // Animate
    const draw = () => {
      breathRef.current += 0.012;
      const breathVal = (Math.sin(breathRef.current) + 1) / 2; // 0–1

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const isDark = forceLight ? false : (forceDark || themeRef.current === "dark");

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cellsRef.current[r]?.[c];
          if (!cell) continue;

          // Ease fill toward target
          cell.fill += (cell.target - cell.fill) * 0.06;
          cell.trail *= 0.94; // fade trail

          // Radial corner fade mask
          const cx = (c + 0.5) * CELL;
          const cy = (r + 0.5) * CELL;
          const dx = (cx / W - 0.5) * 2;
          const dy = (cy / H - 0.5) * 2;
          const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));
          const radialMask = 1 - dist * 0.75;

          // Base grid line opacity: breathing (0 → 0.18) + radial fade
          const baseOpacity =
            (0.005 + breathVal * 0.175) * radialMask;

          const x = c * CELL;
          const y = r * CELL;

          // Grid cell fill
          const fillAmt = Math.max(cell.fill, cell.trail * 0.35);
          if (fillAmt > 0.005) {
            ctx.fillStyle = isDark
              ? `rgba(197,209,0,${fillAmt * 0.18 * radialMask})`
              : `rgba(36,36,36,${fillAmt * 0.08 * radialMask})`;
            ctx.fillRect(x, y, CELL, CELL);
          }

          // Grid lines (right + bottom edge of each cell)
          ctx.strokeStyle = isDark
            ? `rgba(240,236,228,${baseOpacity})`
            : `rgba(36,36,36,${baseOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x + CELL, y);
          ctx.lineTo(x + CELL, y + CELL);
          ctx.moveTo(x, y + CELL);
          ctx.lineTo(x + CELL, y + CELL);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", handleMouse);
      ro.disconnect();
    };
  }, [initCells]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    />
  );
}
