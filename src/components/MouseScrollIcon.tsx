"use client";

import { useEffect, useState } from "react";

export default function MouseScrollIcon({ onClick }: { onClick?: () => void }) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <button
      onClick={onClick}
      aria-label="Scroll down"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: 0,
      }}
    >
      {isTouch ? (
        /* Swipe-down affordance — a dot travelling down a faint track */
        <svg
          width="20"
          height="44"
          viewBox="0 0 20 44"
          fill="none"
          style={{ opacity: 0.55 }}
        >
          <line
            x1="10"
            y1="4"
            x2="10"
            y2="40"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle
            cx="10"
            cy="12"
            r="3.5"
            fill="var(--ink)"
            style={{
              animation: "swipeDown 1.6s ease-in-out infinite",
            }}
          />
        </svg>
      ) : (
        /* Mouse body */
        <svg
          width="28"
          height="44"
          viewBox="0 0 28 44"
          fill="none"
          style={{ opacity: 0.5 }}
        >
          <rect
            x="1"
            y="1"
            width="26"
            height="42"
            rx="13"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
          {/* Scroll wheel dot — animates downward */}
          <rect
            x="12.5"
            y="8"
            width="3"
            height="7"
            rx="1.5"
            fill="var(--ink)"
            style={{
              animation: "scrollWheel 1.6s ease-in-out infinite",
            }}
          />
        </svg>
      )}

      {/* Chevron down */}
      <svg
        width="14"
        height="9"
        viewBox="0 0 14 9"
        fill="none"
        style={{
          opacity: 0.4,
          animation: "arrowBounce 1.6s ease-in-out infinite",
        }}
      >
        <path
          d="M1 1L7 7L13 1"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
