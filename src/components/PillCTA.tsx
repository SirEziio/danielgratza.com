"use client";

import { useState } from "react";
import Link from "next/link";

interface PillCTAProps {
  href?: string;
  onClick?: () => void;
  label: string;
  direction?: "left" | "right"; // left = ← text (default), right = text →
  style?: React.CSSProperties;
}

export default function PillCTA({ href, onClick, label, direction = "left", style }: PillCTAProps) {
  const [hovered, setHovered] = useState(false);

  const chevron =
    direction === "right" ? (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M5 2l5 5-5 5" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M9 2L4 7l5 5" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexDirection: direction === "right" ? "row-reverse" : "row",
        gap: 12,
        border: `1px solid ${hovered ? "rgba(36,36,36,0.25)" : "var(--grid-line)"}`,
        borderRadius: 999,
        padding: "12px 28px",
        background: hovered ? "var(--bg-card)" : "var(--bg)",
        transition: "border-color 0.2s ease, background 0.2s ease",
        cursor: "pointer",
      }}
    >
      {chevron}
      <span
        className="font-futura"
        style={{
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, display: "inline-block", ...style }}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href!} style={{ textDecoration: "none", display: "inline-block", ...style }}>
      {inner}
    </Link>
  );
}
