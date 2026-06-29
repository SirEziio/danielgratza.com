"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import { useTheme } from "@/components/ThemeProvider";

/* ──────────────────────────────────────────────────────────────
   Social icon SVGs
────────────────────────────────────────────────────────────── */
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <rect x="3" y="3" width="30" height="30" rx="5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="15" width="3" height="12" fill="currentColor"/>
      <circle cx="10.5" cy="11.5" r="1.8" fill="currentColor"/>
      <path d="M15 15h3v1.6c.7-1.1 2-1.8 3.5-1.8 2.8 0 4.5 1.9 4.5 5.2V27h-3v-6.5c0-1.7-.8-2.7-2.2-2.7-1.5 0-2.3 1-2.3 2.8V27h-3V15z" fill="currentColor"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <rect x="3" y="3" width="30" height="30" rx="7" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="18" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="26" cy="10" r="1.2" fill="currentColor"/>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <path d="M18 3C10 3 3.5 9.4 3.5 17.4c0 2.5.7 4.9 1.9 7L3 33l8.9-2.3c2 1.1 4.3 1.7 6.6 1.7 8 0 14.5-6.4 14.5-14.4C33 10 27 3 18 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13.5 12.5c-.3-.6-.6-.6-.9-.6-.3 0-.5 0-.8.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.2 2.5 1 3 .8 3.5.7.5-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3-.3-.2-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.1z" fill="currentColor"/>
    </svg>
  );
}

function IconMedium() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="12.5" cy="18" rx="4.5" ry="6" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="23" cy="18" rx="2" ry="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="29.5" cy="18" rx="1" ry="5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconDribbble() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 13c3 1 7 2 11 1.5M10 30c1-4 4-8 9-10M21 4c-2 4-3 9-2 16M32 22c-3-1-6-1.5-10-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Crosshair location pin
────────────────────────────────────────────────────────────── */
function LocationPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
      <circle cx="12" cy="12" r="8.3" stroke="currentColor"/>
      <line x1="11.7" y1="0" x2="11.7" y2="24" stroke="currentColor"/>
      <line x1="24" y1="11.7" x2="0" y2="11.7" stroke="currentColor"/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Corner bracket (same as footer photo brackets)
────────────────────────────────────────────────────────────── */
function CornerBracket({
  vSide, hSide, color,
}: { vSide: "top" | "bottom"; hSide: "left" | "right"; color: string }) {
  const SIZE = 12, THICK = 1.5;
  return (
    <div style={{
      position: "absolute",
      [vSide]: -6, [hSide]: -6,
      width: SIZE, height: SIZE,
      pointerEvents: "none",
      animation: "bracketPulse 3s ease-in-out infinite",
    }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none">
        {vSide === "top" && hSide === "left"  && <><path d={`M${SIZE} ${THICK} H${THICK} V${SIZE}`} stroke={color} strokeWidth={THICK}/></>}
        {vSide === "top" && hSide === "right" && <><path d={`M0 ${THICK} H${SIZE - THICK} V${SIZE}`} stroke={color} strokeWidth={THICK}/></>}
        {vSide === "bottom" && hSide === "left"  && <><path d={`M${SIZE} ${SIZE - THICK} H${THICK} V0`} stroke={color} strokeWidth={THICK}/></>}
        {vSide === "bottom" && hSide === "right" && <><path d={`M0 ${SIZE - THICK} H${SIZE - THICK} V0`} stroke={color} strokeWidth={THICK}/></>}
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Copy-to-clipboard button with "Copied" tooltip
────────────────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "fading">("idle");

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== "idle") return;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("fading"), 1200);
      setTimeout(() => setState("idle"), 2200);
    } catch { /* silent fail */ }
  };

  const tooltipVisible = state === "copied" || state === "fading";

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={handleCopy}
        aria-label={`Copy ${text}`}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "2px 4px", display: "flex", alignItems: "center",
          color: "var(--ink)", opacity: state !== "idle" ? 0.7 : 0.28,
          transition: "opacity 0.2s ease",
        }}
      >
        {state !== "idle" ? (
          /* Checkmark */
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polyline points="2,7 5.5,10.5 11,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          /* Copy icon */
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="4.5" y="4.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M3 8.5H2a.5.5 0 0 1-.5-.5V2A.5.5 0 0 1 2 1.5h6a.5.5 0 0 1 .5.5v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* "Copied" tooltip */}
      <span style={{
        position: "absolute",
        left: "calc(100% + 8px)",
        top: "50%",
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
        fontFamily: '"Futura PT", var(--font-futura), sans-serif',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: "var(--ink)",
        opacity: state === "copied" ? 1 : 0,
        transition: state === "fading" ? "opacity 1s ease" : "opacity 0.15s ease",
        pointerEvents: "none",
      }}>
        Copied
      </span>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Social link
────────────────────────────────────────────────────────────── */
function SocialLink({ href, label, children, delay = 0, isVisible }: {
  href: string; label: string; children: React.ReactNode; delay?: number; isVisible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36,
        color: "var(--ink)",
        opacity: isVisible ? (hovered ? 1 : 0.55) : 0,
        transform: isVisible ? (hovered ? "translateY(-2px)" : "none") : "translateY(12px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}


/* ──────────────────────────────────────────────────────────────
   Main page
────────────────────────────────────────────────────────────── */
const HEADLINE    = "Let's get in touch";
const COORD_L1    = "N  50° 03' 52\"";
const COORD_L2    = "E  14° 27' 09\"";
const COORD_TOTAL = COORD_L1.length + COORD_L2.length;

export default function ContactPage() {
  const [mapHovered, setMapHovered] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [isMid, setIsMid]           = useState(false);
  const [isVisible, setIsVisible]   = useState(false);

  /* Typewriter headline */
  const [typedHeadline, setTypedHeadline] = useState("");
  const [showCursor, setShowCursor]       = useState(true);

  /* Coordinate typewriter */
  const [coordChars, setCoordChars] = useState(0);


  const { theme } = useTheme();
  const isDark = theme === "dark";

  /* Breakpoints */
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 840);
      setIsMid(w >= 540 && w < 840);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Entrance animation */
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* Typewriter — human-like: variable speed, pauses at spaces, micro-hesitation */
  useEffect(() => {
    if (!isVisible) return;
    // Per-character delays (ms) for "Let's get in touch"
    // Spaces get a beat; apostrophe is snappy; slight stumble before "touch"
    const delays = [
      62, 58, 52,           // L e t
      30, 44,               // ' s
      110,                  // (space — beat after "Let's")
      54, 66, 48,           // g e t
      100,                  // (space)
      50, 58,               // i n
      120,                  // (space — tiny hesitation before "touch")
      38, 60, 52, 56, 80,  // t o u c h  (end lands a little slower)
    ];
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i++;
      setTypedHeadline(HEADLINE.slice(0, i));
      if (i >= HEADLINE.length) {
        setTimeout(() => { if (!cancelled) setShowCursor(false); }, 1200);
        return;
      }
      setTimeout(tick, delays[i] ?? 36);
    };
    const start = setTimeout(tick, delays[0]);
    return () => { cancelled = true; clearTimeout(start); };
  }, [isVisible]);

  /* Cursor blink — stops permanently once typewriter sets it to false */
  useEffect(() => {
    const t = setInterval(() => setShowCursor(v => {
      if (v === false && typedHeadline.length >= HEADLINE.length) { clearInterval(t); return false; }
      return !v;
    }), 530);
    return () => clearInterval(t);
  }, [typedHeadline]);

  /* Coordinate typewriter — resets on mouse leave */
  useEffect(() => {
    if (!mapHovered) { setCoordChars(0); return; }
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setCoordChars(i);
      if (i >= COORD_TOTAL) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [mapHovered]);




  /* Bracket colour */
  const bracketColor = isDark ? "rgba(225,223,216,0.70)" : "rgba(36,36,36,0.55)";

  /* Status dot colour */
  const statusColor = isDark ? "#c5d100" : "#2e9e4a";

  return (
    <>
      <Navigation />

      {/* Breathing grid background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <GridBackground />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 80,
          paddingLeft: isMobile ? 24 : 40,
          paddingRight: isMobile ? 24 : 40,
          paddingBottom: "max(48px, calc(env(safe-area-inset-bottom, 0px) + 24px))",
        }}
      >
        {/* ── Main content ──────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 40 : 56,
            width: "100%",
            maxWidth: 920,
          }}
        >

          {/* Heading + status indicator */}
          <div style={{ textAlign: "center" }}>
            <h1
              className="font-caslon"
              style={{ fontSize: "clamp(28px, 2.5vw, 36px)", color: "var(--ink)", letterSpacing: "0.01em", marginBottom: 14, minHeight: "1.3em" }}
            >
              {typedHeadline}
              <span aria-hidden style={{ opacity: showCursor ? 1 : 0, transition: typedHeadline.length >= HEADLINE.length ? "opacity 0.8s ease" : "opacity 0.1s", fontStyle: "normal" }}>_</span>
            </h1>
            {/* Available indicator */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: isVisible ? 1 : 0, transition: "opacity 0.6s ease 900ms" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, animation: "markerFlicker 3s ease-in-out infinite", flexShrink: 0 }} />
              <span className="font-futura" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--ink-faint)" }}>
                Available for work
              </span>
            </div>
          </div>

          {/* ── Single unified card ──────────────────────────────── */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 0.75s ease 480ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) 480ms",
              width: "100%",
              maxWidth: 620,
              position: "relative",
            }}
          >
            {/* HUD corner brackets — snap inward on load, then pulse */}
            {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as [string,string][]).map(([v,h]) => {
              const tx = isVisible ? 0 : (h === "left" ? -10 : 10);
              const ty = isVisible ? 0 : (v === "top"  ? -10 : 10);
              return (
                <div key={`${v}-${h}`} style={{
                  position: "absolute",
                  [v]: -10, [h]: -10,
                  width: 18, height: 18,
                  borderTop:    v === "top"    ? `1px solid ${bracketColor}` : "none",
                  borderBottom: v === "bottom" ? `1px solid ${bracketColor}` : "none",
                  borderLeft:   h === "left"   ? `1px solid ${bracketColor}` : "none",
                  borderRight:  h === "right"  ? `1px solid ${bracketColor}` : "none",
                  transform: `translate(${tx}px, ${ty}px)`,
                  transition: isVisible
                    ? "transform 0.7s cubic-bezier(0.22,1,0.36,1) 200ms, opacity 0.4s ease 200ms"
                    : "none",
                  opacity: isVisible ? 1 : 0,
                  animation: isVisible ? "bracketPulse 2.8s ease-in-out 1s infinite" : "none",
                  pointerEvents: "none",
                  zIndex: 3,
                }} />
              );
            })}

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
              }}
            >

              {/* ── Left: contact info + CTA ─────────────────────── */}
              <div
                style={{
                  flex: "0 0 auto",
                  width: isMobile ? "100%" : 300,
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 36,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Phone */}
                  <div style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "none" : "translateY(14px)",
                    transition: "opacity 0.6s ease 520ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) 520ms",
                  }}>
                    <span className="font-futura" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--ink-faint)", marginBottom: 4 }}>
                      Phone
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <a href="tel:+420601338213" className="font-futura" style={{ fontSize: "clamp(16px, 1.4vw, 19px)", fontWeight: 500, color: "var(--ink)", letterSpacing: "0.02em", textDecoration: "none" }}>
                        +420 601 338 213
                      </a>
                      <CopyButton text="+420601338213" />
                    </div>
                  </div>
                  {/* Email */}
                  <div style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "none" : "translateY(14px)",
                    transition: "opacity 0.6s ease 680ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) 680ms",
                  }}>
                    <span className="font-futura" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--ink-faint)", marginBottom: 4 }}>
                      Email
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <a href="mailto:dxgratza@gmail.com" className="font-futura" style={{ fontSize: "clamp(16px, 1.4vw, 19px)", fontWeight: 500, color: "var(--ink)", letterSpacing: "0.02em", textDecoration: "none" }}>
                        dxgratza@gmail.com
                      </a>
                      <CopyButton text="dxgratza@gmail.com" />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <a
                    href="/cv"
                    className="nav-link"
                    style={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.04em" }}
                  >
                    View CV →
                  </a>
                </div>
              </div>

              {/* ── Right: map ────────────────────────────────────── */}
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
              }}>
                {/* Map image area with whitespace */}
                <div style={{ paddingTop: 36, paddingLeft: 36, paddingRight: 36, paddingBottom: 0 }}>
                  {/* Width-constraining wrapper — 80% centred at mid breakpoint */}
                  <div style={{ width: isMid ? "80%" : "100%", margin: "0 auto" }}>
                  <div
                    onMouseEnter={() => setMapHovered(true)}
                    onMouseLeave={() => setMapHovered(false)}
                    style={{ position: "relative", width: "100%", paddingTop: "56.79%", overflow: "hidden" }}
                  >
                    {/* Outline map — fades out on hover; inverted in dark mode so lines read white */}
                    <img
                      src="/images/contact/map.svg"
                      alt="Czech Republic map"
                      style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        opacity: mapHovered ? 0 : 0.75,
                        filter: isDark ? "invert(1)" : "none",
                        transition: "opacity 0.35s ease",
                      }}
                    />
                    {/* Filled map on hover — dark map in light mode, inverted (white) in dark mode */}
                    <img
                      src="/images/contact/map-dark.svg"
                      alt="" aria-hidden
                      style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        opacity: mapHovered ? 1 : 0,
                        filter: isDark ? "invert(1)" : "none",
                        transition: "opacity 0.35s ease",
                      }}
                    />
                    {/* Prague pin — always white on hover */}
                    <div style={{
                      position: "absolute",
                      left: `${(94 / 324) * 100}%`,
                      top:  `${(63 / 184) * 100}%`,
                      color: mapHovered ? (isDark ? "#1a1a1a" : "#ffffff") : "var(--ink)",
                      opacity: mapHovered ? 1 : 0.7,
                      transform: mapHovered ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "color 0.35s ease, opacity 0.35s ease, transform 0.35s ease",
                    }}>
                      <LocationPin />
                    </div>
                    {/* Coordinates — typewriter on hover */}
                    <div style={{
                      position: "absolute",
                      left: `${(123 / 324) * 100}%`,
                      top:  `${(88  / 184) * 100}%`,
                      opacity: mapHovered ? 1 : 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none",
                    }}>
                      <p className="font-futura" style={{ fontSize: 10, color: isDark ? "#1a1a1a" : "#ffffff", opacity: 0.9, lineHeight: 1.9, margin: 0, whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                        {COORD_L1.slice(0, Math.min(coordChars, COORD_L1.length))}
                        <br />
                        {coordChars > COORD_L1.length ? COORD_L2.slice(0, coordChars - COORD_L1.length) : ""}
                      </p>
                    </div>
                    {/* Corner brackets */}
                    {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as [string,string][]).map(([v,h]) => (
                      <CornerBracket key={`${v}${h}`} vSide={v as "top"|"bottom"} hSide={h as "left"|"right"} color={bracketColor} />
                    ))}
                  </div>
                  </div>{/* end constraining wrapper */}
                </div>

                {/* Location — centered, no divider */}
                <div style={{ padding: "20px 36px 36px", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
                  <span className="font-futura" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--ink-faint)" }}>
                    Location:
                  </span>
                  <span className="font-futura" style={{ fontSize: "clamp(12px, 0.9vw, 13px)", fontWeight: 500, color: "var(--ink)" }}>
                    Prague, Czech Republic
                  </span>
                </div>
              </div>

            </div>
          </div>{/* end single card */}
        </div>{/* end main content */}

        {/* ── Social icons ─────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 10, marginTop: isMobile ? 12 : 0 }}>
          {[
            { href: "https://www.linkedin.com/in/daniel-gratza-82b893210/", label: "LinkedIn",  icon: <IconLinkedIn />  },
            { href: "https://www.instagram.com/dxgratza/",                  label: "Instagram", icon: <IconInstagram /> },
            { href: "https://wa.me/420601338213",                            label: "WhatsApp",  icon: <IconWhatsApp />  },
            { href: "https://medium.com/@danielgratza",                      label: "Medium",    icon: <IconMedium />    },
            { href: "https://dribbble.com/danielgratza",                     label: "Dribbble",  icon: <IconDribbble />  },
          ].map(({ href, label, icon }, i) => (
            <SocialLink key={label} href={href} label={label} delay={400 + i * 60} isVisible={isVisible}>
              {icon}
            </SocialLink>
          ))}
        </div>
      </div>
    </>
  );
}
