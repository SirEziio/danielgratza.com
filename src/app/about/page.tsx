"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import PillCTA from "@/components/PillCTA";

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

const ROW_H = 72; // px per timeline row — matches Figma's 72 px spacing

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
  const isLeft = entry.side === "left";
  const delay = index * 200; // ms stagger per row

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: ROW_H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: 6,
        gap: 4,
        cursor: "default",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "none"
          : isLeft
            ? "translateX(-16px)"
            : "translateX(16px)",
        transition: `opacity 850ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 850ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
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
  );
}

/* ─────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const [timelineVisible, setTimelineVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1280);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimelineVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navigation />

      {/* Breathing grid background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <GridBackground />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "clamp(80px, 8vw, 120px) clamp(40px, 5vw, 80px) 80px" }}>
      <div
        className="about-layout"
        style={{
          width: "100%",
          maxWidth: 1600,
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: "clamp(60px, 6.5vw, 100px)",
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Bio ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
          {/* Intro headline */}
          <p
            className="font-futura"
            style={{
              fontSize: "clamp(18px, 1.67vw, 24px)",
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1.45,
              textAlign: "justify",
            }}
          >
            Hi, I&rsquo;m Daniel — a designer who thinks like a psychologist and works like a builder.
          </p>

          <p
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.35vw, 19px)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1.75,
              textAlign: "justify",
            }}
          >
            I started out fascinated by how people think, which led me to study psychology and sociology. Somewhere along the way, I picked up a love for digital design — and realized I could combine both to create things that are not only beautiful, but make sense to people.
          </p>

          <p
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.35vw, 19px)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1.75,
              textAlign: "justify",
            }}
          >
            These days, I focus on mobile-first UX/UI, backed by research, experimentation, and collaboration with developers and product teams. I&rsquo;m equally comfortable sketching flows, tweaking UI details, or diving into test results.
          </p>

          <p
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.35vw, 19px)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1.75,
              textAlign: "justify",
            }}
          >
            Outside the screen, I unwind through climbing, hiking, or getting lost with my camera. Movement is how I reset. Design is how I think.
          </p>

          {/* Contact Me button */}
          <div style={{ paddingTop: 40 }}>
            <PillCTA href="/contact" label="Contact me" />
          </div>
        </div>

        {/* ── RIGHT: Timeline ── */}
        <div ref={timelineRef}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {ENTRIES.map((entry, i) => (
                <div
                  key={`${entry.year}-${entry.org}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingBottom: 20,
                    opacity: timelineVisible ? 1 : 0,
                    transform: timelineVisible ? "none" : "translateY(12px)",
                    transition: `opacity 600ms ease ${i * 100}ms, transform 600ms ease ${i * 100}ms`,
                  }}
                >
                  {/* Org circle */}
                  <div style={{ flexShrink: 0, paddingTop: 1 }}>
                    <OrgCircle color={entry.color} initials={entry.initials} scaled={false} iconSrc={entry.iconSrc} />
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span className="font-futura" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>
                        {entry.org}
                      </span>
                      <span className="font-futura" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                        {entry.year}
                      </span>
                      {entry.current && (
                        <span className="font-futura" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)", fontWeight: 700 }}>
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
