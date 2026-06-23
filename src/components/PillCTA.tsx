"use client";

import { useState } from "react";
import Link from "next/link";

interface PillCTAProps {
  href: string;
  label: string;
  style?: React.CSSProperties;
}

const DURATION = "0.45s";
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const TRANSITION = `${DURATION} ${EASE}`;

/* Arrow SVG using currentColor */
function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M2 8h12M8 2l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PillCTA({ href, label, style }: PillCTAProps) {
  const [hovered, setHovered] = useState(false);

  const contentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    whiteSpace: "nowrap",
  };

  const textStyle: React.CSSProperties = {
    fontFamily: '"Futura PT", var(--font-futura), sans-serif',
    fontSize: 20,
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    lineHeight: 1,
  };

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        border: "2px solid var(--ink)",
        borderRadius: 28,
        padding: "6px 18px",
        textDecoration: "none",
        cursor: "pointer",
        ...style,
      }}
    >
      {/* Sliding ink fill — grows left → right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--ink)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition: `transform ${TRANSITION}`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Base layer — ink colored (shows where fill hasn't reached yet) */}
      <div style={{ ...contentStyle, position: "relative", zIndex: 1, color: "var(--ink)" }}>
        <span style={textStyle}>{label}</span>
        <Arrow />
      </div>

      {/* Top layer — bg colored, clipped to the filled region only */}
      <div
        style={{
          ...contentStyle,
          position: "absolute",
          inset: 0,
          padding: "6px 18px",
          color: "var(--bg)",
          clipPath: hovered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path ${TRANSITION}`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <span style={textStyle}>{label}</span>
        <Arrow />
      </div>
    </Link>
  );
}
