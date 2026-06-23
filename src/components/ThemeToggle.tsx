"use client";

import { useTheme } from "./ThemeProvider";

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: 64,
        height: 36,
        borderRadius: 100,
        background: isDark ? "#e1dfd8" : "#242424",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        overflow: "hidden",
        transition: "background 0.35s ease",
        padding: 0,
      }}
    >
      {/* Sliding knob */}
      <span
        style={{
          position: "absolute",
          top: 4,
          left: isDark ? 32 : 4,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isDark ? "#242424" : "#ffffff",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
          color: isDark ? "#e1dfd8" : "#242424",
        }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
