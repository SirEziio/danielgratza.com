"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import { useTheme } from "@/components/ThemeProvider";

/* ─────────────────────────────────────────────────────────────
   Timeline data (matches Figma exactly)
───────────────────────────────────────────────────────────── */
interface Entry {
  year: string;
  org: string;
  role: string;
  side: "left" | "right";  // left = text → dot, right = dot → text
  color: string;
  initials: string;
  iconSrc?: string;
  current?: boolean;
}

const ENTRIES: Entry[] = [
  { year: "2015", org: "Masaryk University",  role: "Computer graphics & Image processing", side: "left",  color: "#0000EE", initials: "M",  iconSrc: "/images/contact/muni.png" },
  { year: "2018", org: "Ambienten VIP",       role: "Graphic designer",                    side: "right", color: "#9B8B6E", initials: "A",  iconSrc: "/images/contact/ambienten.png" },
  { year: "2019", org: "Kiwi.com",            role: "Order processing specialist",         side: "left",  color: "#00B2A9", initials: "K",  iconSrc: "/images/contact/kiwi.png" },
  { year: "2020", org: "Masaryk University",  role: "Psychology & Sociology",              side: "right", color: "#0000EE", initials: "M",  iconSrc: "/images/contact/muni.png" },
  { year: "2020", org: "Brightify",           role: "UX / UI Lead designer",               side: "left",  color: "#FFC200", initials: "B",  iconSrc: "/images/contact/brightify.png" },
  { year: "2021", org: "T-Mobile CZ",         role: "Sales consultant",                    side: "right", color: "#E4003A", initials: "T",  iconSrc: "/images/contact/tmobile.png" },
  { year: "2024", org: "Livesport",           role: "Conversion rate optimization specialist", side: "left", color: "#0A1628", initials: "LS", iconSrc: "/images/contact/livesport.png" },
  { year: "2025", org: "Ackee",               role: "UX / UI Designer",                    side: "right", color: "#2200FF", initials: "A",  iconSrc: "/images/contact/ackee.png", current: true },
];

const ROW_H = 108; // px per timeline row — tall enough for 2-line role text + symmetric top/bottom padding when hovered

/* ─────────────────────────────────────────────────────────────
   Small colored circle with initials
───────────────────────────────────────────────────────────── */
function OrgCircle({ color, initials, scaled, iconSrc }: { color: string; initials: string; scaled: boolean; iconSrc?: string }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: iconSrc ? "transparent" : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        transform: scaled ? "scale(1.25)" : "scale(1)",
        transition: "transform 0.2s ease",
        boxShadow: scaled ? `0 2px 10px ${color}55` : "none",
      }}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <span
          style={{
            fontSize: 7,
            color: "#fff",
            fontFamily: '"Futura PT", var(--font-futura), sans-serif',
            fontWeight: 700,
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Single timeline row
───────────────────────────────────────────────────────────── */
function TimelineRow({ entry, index, visible }: { entry: Entry; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isLeft = entry.side === "left";
  const delay = index * 200;

  const cardBg = isDark
    ? "linear-gradient(-59.58deg, rgba(255,255,255,0.08) 7.637%, rgba(255,255,255,0.04) 92.363%)"
    : "linear-gradient(-59.58deg, rgba(255,255,255,0.55) 7.637%, rgba(255,255,255,0.25) 92.363%)";

  return (
    // Outer — handles entrance animation only
    <div
      style={{
        height: ROW_H,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : isLeft ? "translateX(-16px)" : "translateX(16px)",
        transition: `opacity 850ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 850ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        position: "relative",
        zIndex: hovered ? 10 : 1,
      }}
    >
    {/* Inner — hover card; scale only, no layout changes */}
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: hovered ? 14 : 6,
        paddingBottom: hovered ? 14 : 6,
        paddingInline: hovered ? 20 : 4,
        gap: 4,
        cursor: "default",
        borderRadius: 10,
        background: hovered ? cardBg : "transparent",
        backdropFilter: hovered ? "blur(14px)" : "none",
        WebkitBackdropFilter: hovered ? "blur(14px)" : "none",
        boxShadow: hovered ? "0 8px 40px rgba(0,0,0,0.12)" : "none",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        transition: "background 0.28s ease, box-shadow 0.28s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Main row: [left half] [dot] [right half] */}
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>

        {/* LEFT HALF */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            paddingRight: 12,
          }}
        >
          {isLeft ? (
            <>
              <span
                className="font-futura"
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  color: hovered ? "var(--ink)" : "var(--ink)",
                  opacity: hovered ? 1 : 0.85,
                  transition: "opacity 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.org}
              </span>
              <OrgCircle color={entry.color} initials={entry.initials} scaled={hovered} iconSrc={entry.iconSrc} />
              <span
                className="font-futura"
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#aaa",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.year}
              </span>
            </>
          ) : null}
        </div>

        {/* CENTER DOT placeholder — real dot rendered in absolute layer on parent */}
        <div style={{ width: 10, height: 10, flexShrink: 0 }} />

        {/* RIGHT HALF */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 12,
          }}
        >
          {!isLeft ? (
            <>
              <span
                className="font-futura"
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#aaa",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.year}
              </span>
              <OrgCircle color={entry.color} initials={entry.initials} scaled={hovered} iconSrc={entry.iconSrc} />
              <span
                className="font-futura"
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  color: "var(--ink)",
                  opacity: hovered ? 1 : 0.85,
                  transition: "opacity 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.org}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Role / subtitle row — aligned to company name position */}
      {entry.role && (
        <div
          style={{
            display: "flex",
            // LEFT: text ends where company name ends (before year+gap+icon+gap from center ≈ 90px)
            // RIGHT: text starts where company name starts (after year+gap+icon+gap from center ≈ 90px)
            paddingLeft: isLeft ? 0 : "calc(50% + 90px)",
            paddingRight: isLeft ? "calc(50% + 90px)" : 0,
            justifyContent: isLeft ? "flex-end" : "flex-start",
          }}
        >
          <span
            className="font-futura"
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--ink-muted)",
              opacity: hovered ? 1 : 0.75,
              transition: "opacity 0.2s ease",
            }}
          >
            {entry.role}
          </span>
        </div>
      )}
    </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Simple list row (used at <1280px) — same card hover effect
───────────────────────────────────────────────────────────── */
function SimpleRow({ entry, index, visible }: { entry: Entry; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark
    ? "linear-gradient(-59.58deg, rgba(255,255,255,0.08) 7.637%, rgba(255,255,255,0.04) 92.363%)"
    : "linear-gradient(-59.58deg, rgba(255,255,255,0.55) 7.637%, rgba(255,255,255,0.25) 92.363%)";

  return (
    // Outer — entrance animation + layout anchor (never changes size)
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        zIndex: hovered ? 10 : 1,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(12px)",
        transition: `opacity 600ms ease ${index * 100}ms, transform 600ms ease ${index * 100}ms`,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        paddingBottom: 20,
        cursor: "default",
      }}
    >
      {/* Absolutely positioned card — expands on hover without shifting layout */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: hovered ? "-12px -16px 8px" : "0",
          borderRadius: 10,
          background: hovered ? cardBg : "transparent",
          backdropFilter: hovered ? "blur(14px)" : "none",
          WebkitBackdropFilter: hovered ? "blur(14px)" : "none",
          boxShadow: hovered ? "0 8px 40px rgba(0,0,0,0.12)" : "none",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transformOrigin: "left center",
          transition: "background 0.28s ease, box-shadow 0.28s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1), inset 0.3s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Content — scales with the card */}
      <div style={{ flexShrink: 0, paddingTop: 1, position: "relative", zIndex: 1, transform: hovered ? "scale(1.06)" : "scale(1)", transformOrigin: "left center", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
        <OrgCircle color={entry.color} initials={entry.initials} scaled={hovered} iconSrc={entry.iconSrc} />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1, transform: hovered ? "scale(1.06)" : "scale(1)", transformOrigin: "left center", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span className="font-futura" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>
            {entry.org}
          </span>
          <span className="font-futura" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-faint)" }}>
            {entry.year}
          </span>
          {entry.current && (
            <span className="font-futura" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-faint)", fontWeight: 700 }}>
              current
            </span>
          )}
        </div>
        {entry.role && (
          <p className="font-futura" style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-muted)", marginTop: 2 }}>
            {entry.role}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const [bioVisible, setBioVisible]           = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1400);

  useEffect(() => {
    const check = () => setVw(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ≤640px  → stacked (single column)
  // <1280px → two columns, simple list timeline
  // ≥1280px → two columns, fancy centre-line timeline
  const isStacked = vw <= 640;
  const isSimple  = vw < 1280;
  const isMobile  = isStacked;

  // Bio fades in on mount; timeline starts only after bio is visible
  useEffect(() => {
    const t1 = setTimeout(() => setBioVisible(true), 80);
    const t2 = setTimeout(() => setTimelineVisible(true), 880);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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
          paddingTop: "clamp(96px, 8vw, 128px)",
          paddingBottom: "80px",
          // ≤840px  → 8vw (matches nav gutter)
          // 841–1280px → 15vw (narrower content band)
          // >1280px → 10vw capped at 120px (wider content)
          paddingLeft:  vw <= 840 ? "var(--page-pad)" : vw <= 1280 ? "clamp(60px, 15vw, 160px)" : "clamp(40px, 10vw, 120px)",
          paddingRight: vw <= 840 ? "var(--page-pad)" : vw <= 1280 ? "clamp(60px, 15vw, 160px)" : "clamp(40px, 10vw, 120px)",
        }}
      >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          flexDirection: isStacked ? "column" : "row",
          gap: isStacked ? "48px" : "clamp(40px, 4vw, 60px)",
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Bio ── */}
        <div style={{
          // always fills remaining space after the timeline column
          flex: "1 1 auto",
          minWidth: 0,
          maxWidth: isStacked ? "none" : 700,
          display: "flex",
          flexDirection: "column",
          gap: 19,
        }}>
          {/* Intro headline */}
          <p
            className="font-futura"
            style={{
              fontSize: "clamp(17px, 1.35vw, 21px)",
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1.45,
              textAlign: "justify",
              opacity: bioVisible ? 1 : 0,
              transform: bioVisible ? "none" : "translateY(16px)",
              transition: "opacity 0.65s ease 80ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) 80ms",
            }}
          >
            Hi, I&rsquo;m Daniel — a designer who thinks like a psychologist and works like a builder.
          </p>

          <p
            className="font-futura"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1.75,
              textAlign: "justify",
              opacity: bioVisible ? 1 : 0,
              transform: bioVisible ? "none" : "translateY(16px)",
              transition: "opacity 0.65s ease 220ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) 220ms",
            }}
          >
            I started out fascinated by how people think, which led me to study psychology and sociology. Somewhere along the way, I picked up a love for digital design — and realized I could combine both to create things that are not only beautiful, but make sense to people.
          </p>

          <p
            className="font-futura"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1.75,
              textAlign: "justify",
              opacity: bioVisible ? 1 : 0,
              transform: bioVisible ? "none" : "translateY(16px)",
              transition: "opacity 0.65s ease 360ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) 360ms",
            }}
          >
            These days, I focus on mobile-first UX/UI, backed by research, experimentation, and collaboration with developers and product teams. I&rsquo;m equally comfortable sketching flows, tweaking UI details, or diving into test results.
          </p>

          <p
            className="font-futura"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1.75,
              textAlign: "justify",
              opacity: bioVisible ? 1 : 0,
              transform: bioVisible ? "none" : "translateY(16px)",
              transition: "opacity 0.65s ease 500ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) 500ms",
            }}
          >
            Outside the screen, I unwind through climbing, hiking, or getting lost with my camera. Movement is how I reset. Design is how I think.
          </p>

          {/* Contact Me button */}
          <div style={{
            paddingTop: 40, display: "flex", justifyContent: "flex-end",
            opacity: bioVisible ? 1 : 0,
            transform: bioVisible ? "none" : "translateY(16px)",
            transition: "opacity 0.65s ease 640ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) 640ms",
          }}>
            <a
              href="/contact"
              className="nav-link"
              style={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.04em" }}
            >
              Contact me →
            </a>
          </div>
        </div>

        {/* ── RIGHT: Timeline ── */}
        <div ref={timelineRef} style={{
          // simple: auto-size to list content (no gap on right)
          // fancy: fixed basis growing from 520px min → 640px max with viewport
          flex: isStacked ? "1 1 auto" : isSimple ? "0 0 auto" : "0 0 clamp(520px, 40vw, 640px)",
          minWidth: 0,
        }}>
          {isSimple ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {ENTRIES.map((entry, i) => (
                <SimpleRow key={`${entry.year}-${entry.org}`} entry={entry} index={i} visible={timelineVisible} />
              ))}
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Vertical center line — grows downward with the stagger */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 6 + 6,
                  height: (ENTRIES.length - 1) * ROW_H + 12,
                  width: 1,
                  background: "var(--ink)",
                  opacity: 0.35,
                  transform: `translateX(-50%) scaleY(${timelineVisible ? 1 : 0})`,
                  transformOrigin: "top center",
                  transition: `transform ${(ENTRIES.length - 1) * 200}ms linear 50ms`,
                  pointerEvents: "none",
                }}
              />

              {/* Dots — absolutely positioned so they fade in place, not sliding */}
              {ENTRIES.map((entry, i) => (
                <div
                  key={`dot-${i}`}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: i * ROW_H + 7,
                    transform: "translateX(-50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `1.5px solid ${entry.current ? "var(--ink)" : "var(--ink-faint)"}`,
                    background: entry.current ? "var(--ink)" : "var(--bg)",
                    zIndex: 2,
                    opacity: timelineVisible ? 1 : 0,
                    transition: `opacity 600ms ease ${i * 200 + 200}ms`,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Entries */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {ENTRIES.map((entry, i) => (
                  <TimelineRow key={`${entry.year}-${entry.org}`} entry={entry} index={i} visible={timelineVisible} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
