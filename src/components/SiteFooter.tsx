"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import GridBackground from "./GridBackground";

/* ─────────────────────────────────────────────────────────────────
   SiteFooter — the homepage footer, extracted for every other page.
   Self-contained: drives its own visibility (IntersectionObserver),
   photo tilt, glitch timer, and coordinate HUD.
───────────────────────────────────────────────────────────────── */

function FooterCTA({ isVisible }: { isVisible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const fg = "#e1dfd8";
  const borderBase = "rgba(225,223,216,0.22)";
  const borderHov = "rgba(225,223,216,0.65)";
  const bgHov = "rgba(225,223,216,0.07)";
  return (
    <a
      href="/contact"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 12,
        padding: "14px 36px",
        border: `1px solid ${hovered ? borderHov : borderBase}`,
        background: hovered ? bgHov : "transparent",
        color: fg,
        fontFamily: '"Futura PT", var(--font-futura), sans-serif',
        fontSize: "0.8rem", fontWeight: 400,
        letterSpacing: "0.14em", textTransform: "uppercase",
        textDecoration: "none", cursor: "pointer", borderRadius: 0,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateY(18px)",
        transition: `border-color 0.25s ease, background 0.25s ease, opacity 0.85s ease 520ms, transform 0.85s cubic-bezier(0.22,1,0.36,1) 520ms`,
      }}
    >
      Get in touch
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
        style={{ opacity: 0.6, transition: "transform 0.25s ease", transform: hovered ? "translateX(3px)" : "none" }}>
        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  );
}

function FooterPhoto({
  isVisible, tilt, glitching,
}: { isVisible: boolean; tilt: { x: number; y: number }; glitching: boolean }) {
  const faceBg = "linear-gradient(145deg,#2c2c2c 0%,#3a3a3a 55%,#272727 100%)";
  const ring = "rgba(255,255,255,0.12)";
  const bracket = "rgba(225,223,216,0.35)";
  const CORNERS: [string, string][] = [["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]];

  return (
    <div style={{
      flexShrink: 0,
      position: "relative",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "none" : "translateY(24px) scale(0.88)",
      transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 80ms, transform 1.2s cubic-bezier(0.22,1,0.36,1) 80ms",
    }}>
      <div style={{ position: "relative", animation: isVisible ? "footerFloat 5s ease-in-out 1.5s infinite" : "none" }}>
        {CORNERS.map(([v, h], i) => (
          <div key={`${v}-${h}`} style={{
            position: "absolute",
            [v]: -12, [h]: -12,
            width: 16, height: 16,
            borderTop: v === "top" ? `1px solid ${bracket}` : "none",
            borderBottom: v === "bottom" ? `1px solid ${bracket}` : "none",
            borderLeft: h === "left" ? `1px solid ${bracket}` : "none",
            borderRight: h === "right" ? `1px solid ${bracket}` : "none",
            animation: isVisible ? `bracketPulse ${2.2 + i * 0.4}s ease-in-out infinite` : "none",
            pointerEvents: "none", zIndex: 3,
          }} />
        ))}
        <div style={{
          transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.08s linear",
        }}>
          <div style={{
            width: "clamp(8.7500rem, 18vw, 13.7500rem)",
            height: "clamp(8.7500rem, 18vw, 13.7500rem)",
            borderRadius: "50%",
            background: faceBg,
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px ${ring}`,
            animation: glitching ? "photoGlitch 0.45s steps(4, end) forwards" : "none",
          }}>
            <Image
              src="/images/daniel.png"
              alt="Daniel Gratza"
              width={400}
              height={400}
              sizes="220px"
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Radar contacts — rarely, the sweep "finds" something: a tiny craft
   pops in just behind the beam and fades away. Exported so the homepage
   footer can use the same sky. ── */
const NEON_GLOW = {
  filter:
    "drop-shadow(0 0 2px rgba(197,209,0,0.45)) drop-shadow(0 0 7px rgba(197,209,0,0.2))",
};

/* Fighter wireframes — retro vector-monitor style: neon outline + interior
   mesh, heavy bloom. Each hull is one continuous angular polygon; the mesh
   is the surface grid. Nose points +x. */
const SHIPS: { hull: string; mesh: string }[] = [
  /* 0 — "X-foil": long nosecone, two swept wing spikes per side */
  {
    hull: `M62 20 L34 16.8 L24 15.6 L8 5.5 L5 8 L17 16 L12 15.6 L1 11.5 L0.5 14.5 L10 17.4 L7 18.4
      L7 21.6 L10 22.6 L0.5 25.5 L1 28.5 L12 24.4 L17 24 L5 32 L8 34.5 L24 24.4 L34 23.2 Z`,
    mesh: `M60 20 H8 M52 18.6 L52 21.4 M44 17.9 L44 22.1 M36 17.1 L36 22.9 M28 16.2 L28 23.8
      M24 15.6 L8.5 6.5 M24 24.4 L8.5 33.5 M12 15.9 L2 12.5 M12 24.1 L2 27.5`,
  },
  /* 1 — "A-dart": compact arrowhead with a serrated tail */
  {
    hull: `M58 20 L18 6.5 L9.5 9 L16 14.5 L5.5 17 L8.5 20 L5.5 23 L16 25.5 L9.5 31 L18 33.5 Z`,
    mesh: `M58 20 H8.5 M46 16 L46 24 M36 12.6 L36 27.4 M26 9.2 L26 30.8 M18 6.5 L9 20 M18 33.5 L9 20`,
  },
  /* 2 — "Claw": heavy interceptor with forward-swept talons */
  {
    hull: `M60 20 L42 16.5 L34 12 L26 3.5 L20 5 L28 14 L14 12.5 L4 14.5 L12 17 L7 20 L12 23 L4 25.5
      L14 27.5 L28 26 L20 35 L26 36.5 L34 28 L42 23.5 Z`,
    mesh: `M58 20 H9 M50 18.4 L50 21.6 M42 16.6 L42 23.4 M34 13 L34 27 M25 13.6 L25 26.4
      M28 13.8 L22 5.5 M28 26.2 L22 34.5`,
  },
];

function ShipSvg({ type = 0, scale = 1 }: { type?: number; scale?: number }) {
  const ship = SHIPS[Math.abs(type || 0) % SHIPS.length];
  const s = Number.isFinite(scale) && scale! > 0 ? scale! : 0.55; // never NaN a width
  return (
    <svg width={64 * s} height={40 * s} viewBox="0 0 64 40" fill="none" style={NEON_GLOW}>
      <defs>
        <linearGradient id="blipHull" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="rgba(197,209,0,0.12)" />
          <stop offset="0.5" stopColor="rgba(197,209,0,0.03)" />
          <stop offset="0.8" stopColor="rgba(197,209,0,0)" />
        </linearGradient>
        <filter id="blipGrain" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" />
        </filter>
      </defs>
      <g filter="url(#blipGrain)" strokeLinejoin="miter" strokeLinecap="butt">
        {/* Surface mesh — the vector-monitor wireframe */}
        <path d={ship.mesh} stroke="rgba(197,209,0,0.22)" strokeWidth="0.6" />
        {/* Hull outline — brightest line on the scope */}
        <path d={ship.hull} fill="url(#blipHull)" stroke="rgba(197,209,0,0.55)" strokeWidth="1" />
      </g>
    </svg>
  );
}

interface Contact {
  x: number; y: number;       // % of container
  vx: number; vy: number;     // % per ms
  heading: number;            // rad, screen coords
  fleet: boolean;
  shipType: number;           // fixed for the whole crossing
  size: number;               // fixed for the whole crossing
  dots: { x: number; y: number; s: number }[] | null; // swarm contacts
  lastTick: number;
}
interface Echo {
  id: number; x: number; y: number; heading: number;
  fleet: boolean; shipType: number; size: number;
  dots: { x: number; y: number; s: number }[] | null;
}

export function RadarBlips({ active }: { active: boolean }) {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);
  const contactRef = useRef<Contact | null>(null);
  const nextSpawnRef = useRef(0);
  const lastBeamRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    if (!startRef.current) startRef.current = performance.now();
    /* The sweep is a sibling element — read its LIVE rotation each tick so
       echoes always match the beam the visitor actually sees */
    const sweepEl = wrapRef.current?.parentElement?.querySelector<HTMLElement>("[data-radar-sweep]") ?? null;
    const iv = setInterval(() => {
      const now = performance.now();
      /* Beam angle (0° = up, clockwise): true CSS transform if available,
         internal 8s clock as fallback */
      let beam = (((now - startRef.current) / 8000) * 360) % 360;
      if (sweepEl) {
        const tr = getComputedStyle(sweepEl).transform;
        const m = tr.match(/matrix\(([^)]+)\)/);
        if (m) {
          const [a, b] = m[1].split(",").map(Number);
          beam = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
        }
      }

      /* Spawn a traveler: random edge entry, roughly inward heading, random speed */
      if (!contactRef.current && now > nextSpawnRef.current) {
        const entryA = Math.random() * 2 * Math.PI;
        const aimA = entryA + Math.PI + (Math.random() - 0.5) * 1.1;
        const speed = (0.9 + Math.random() * 1.9) / 1000; // % per ms → 30–90s traverse
        const isSwarm = Math.random() < 0.35;
        contactRef.current = {
          x: 50 + Math.cos(entryA) * 46,
          y: 50 + Math.sin(entryA) * 46,
          vx: Math.cos(aimA) * speed,
          vy: Math.sin(aimA) * speed,
          heading: aimA,
          fleet: !isSwarm && Math.random() < 0.5,
          shipType: Math.floor(Math.random() * SHIPS.length),
          size: 0.45 + Math.random() * 0.25,
          dots: isSwarm
            ? Array.from({ length: 5 + Math.floor(Math.random() * 5) }, () => ({
                x: (Math.random() - 0.5) * 36,
                y: (Math.random() - 0.5) * 26,
                s: 1.8 + Math.random() * 2.4,
              }))
            : null,
          lastTick: now,
        };
      }

      const c = contactRef.current;
      if (c) {
        /* The ship flies whether or not anyone is watching */
        const dt = now - c.lastTick;
        c.lastTick = now;
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        if (Math.abs(c.x - 50) > 48 || Math.abs(c.y - 50) > 48) {
          /* Left the scope — next traveler later */
          contactRef.current = null;
          nextSpawnRef.current = now + 20000 + Math.random() * 30000; // next traveler in 20–50s
        } else {
          /* Paint an echo only when the beam sweeps across its bearing */
          const bearing =
            (Math.atan2(c.x - 50, -(c.y - 50)) * 180) / Math.PI;
          const b = (bearing + 360) % 360;
          const prev = lastBeamRef.current;
          const crossed =
            prev <= beam ? b > prev && b <= beam : b > prev || b <= beam; // handles wrap
          if (crossed) {
            const id = now;
            setEchoes((es) => [
              ...es.slice(-4),
              { id, x: c.x, y: c.y, heading: c.heading, fleet: c.fleet, shipType: c.shipType, size: c.size, dots: c.dots },
            ]);
            setTimeout(() => {
              setEchoes((es) => es.filter((e) => e.id !== id));
            }, 6000);
          }
        }
      }
      lastBeamRef.current = beam;
    }, 120);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {echoes.map((e) => (
        <div
          key={e.id}
          style={{
            position: "absolute",
            left: `${e.x}%`,
            top: `${e.y}%`,
            transform: `translate(-50%, -50%) rotate(${e.heading}rad)`,
            animation: "radarEcho 5.5s linear forwards",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {e.dots ? (
            /* Classic scope contact — a swarm of glowing dots */
            <div style={{ position: "relative" }}>
              {e.dots.map((d, di) => (
                <div
                  key={di}
                  style={{
                    position: "absolute",
                    left: d.x,
                    top: d.y,
                    width: d.s,
                    height: d.s,
                    borderRadius: "50%",
                    background: "rgba(197,209,0,0.75)",
                    boxShadow: "0 0 5px rgba(197,209,0,0.5), 0 0 12px rgba(197,209,0,0.2)",
                  }}
                />
              ))}
            </div>
          ) : e.fleet ? (
            <div style={{ position: "relative" }}>
              <ShipSvg type={e.shipType} scale={e.size} />
              <div style={{ position: "absolute", left: -30 * e.size, top: 16 * e.size, opacity: 0.75 }}>
                <ShipSvg type={e.shipType} scale={e.size * 0.8} />
              </div>
              <div style={{ position: "absolute", left: -24 * e.size, top: -18 * e.size, opacity: 0.75 }}>
                <ShipSvg type={e.shipType} scale={e.size * 0.8} />
              </div>
              <div style={{ position: "absolute", left: -52 * e.size, top: 0, opacity: 0.55 }}>
                <ShipSvg type={e.shipType} scale={e.size * 0.7} />
              </div>
            </div>
          ) : (
            <ShipSvg type={e.shipType} scale={e.size} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SiteFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);       // triggers the entrance, once
  const [inView, setInView] = useState(false);   // live — drives tilt/HUD
  const [isMobile, setIsMobile] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePx, setMousePx] = useState({ x: 0, y: 0 });
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 840);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.intersectionRatio > 0.35) setSeen(true);
      },
      { threshold: [0, 0.35] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Full-screen tilt — only while the footer is on screen
  useEffect(() => {
    if (!inView) {
      setTilt({ x: 0, y: 0 });
      return;
    }
    const handler = (e: MouseEvent) => {
      const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setTilt({ x: dy * -16, y: dx * 16 });
      setMousePx({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [inView]);

  // Occasional glitch — starts after the footer first appears
  useEffect(() => {
    if (!seen) return;
    let t: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setGlitch(true);
        t2 = setTimeout(() => setGlitch(false), 450);
        schedule();
      }, 8000 + Math.random() * 10000);
    };
    schedule();
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [seen]);

  return (
    <div
      ref={ref}
      data-site-footer
      style={{
        background: "#1a1a1a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Breathing interactive grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GridBackground forceDark={true} />
      </div>

      {/* Radar sweep */}
      <div data-radar-sweep style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "max(150vw, 150vh)", height: "max(150vw, 150vh)",
        transform: "translate(-50%, -50%)",
        background: "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(225,223,216,0.02) 315deg, rgba(225,223,216,0.07) 348deg, rgba(225,223,216,0.14) 360deg)",
        animation: "radarSweep 8s linear infinite",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "clamp(22.5000rem, 55vw, 43.7500rem)",
          height: "clamp(22.5000rem, 55vw, 43.7500rem)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,209,0,0.07) 0%, transparent 65%)",
          filter: "blur(40px)",
          opacity: seen ? 1 : 0,
          transition: "opacity 1.8s ease 100ms",
          animation: seen ? "footerGlowPulse 4s ease-in-out 1.8s infinite" : "none",
        }} />
      </div>

      {/* Radar contacts — the sweep occasionally finds something */}
      <RadarBlips active={seen} />

      {/* Decorative + markers */}
      {[
        { left: "8%", top: "18%", delay: "0s" },
        { left: "88%", top: "72%", delay: "1.1s" },
        { left: "12%", top: "78%", delay: "2.3s" },
        { left: "82%", top: "22%", delay: "0.7s" },
      ].map((pos, i) => (
        <div key={i} style={{
          position: "absolute", ...pos,
          fontSize: 9,
          color: "rgba(225,223,216,0.2)",
          fontFamily: "monospace",
          lineHeight: 1,
          pointerEvents: "none", zIndex: 1, userSelect: "none",
          animation: `markerFlicker ${5 + i * 1.3}s ease ${pos.delay} infinite`,
        }}>+</div>
      ))}

      {/* Mouse coordinate HUD */}
      <div className="font-futura" style={{
        position: "absolute", bottom: "clamp(1rem, 2.5vw, 1.75rem)", right: "clamp(20px, 3vw, 36px)",
        fontSize: 9, letterSpacing: "0.1em",
        color: "rgba(225,223,216,0.28)",
        fontVariantNumeric: "tabular-nums",
        pointerEvents: "none", zIndex: 2, userSelect: "none",
        opacity: seen ? 1 : 0,
        transition: "opacity 1s ease 1.2s",
      }}>
        {`${mousePx.x.toString(16).padStart(4, "0").toUpperCase()} · ${mousePx.y.toString(16).padStart(4, "0").toUpperCase()}`}
      </div>

      {/* Row layout: photo left, text right */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        gap: isMobile ? "clamp(1.75rem, 5vw, 2.5rem)" : "clamp(48px, 7vw, 100px)",
        padding: "clamp(2rem, 5vw, 3.5000rem) clamp(32px, 9vw, 100px)",
        maxWidth: 900,
        width: "100%",
      }}>
        <FooterPhoto isVisible={seen} tilt={tilt} glitching={glitch} />

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: isMobile ? "center" : "flex-start",
          textAlign: isMobile ? "center" : "left",
        }}>
          <h2
            className="font-caslon"
            style={{
              fontSize: "clamp(1.8rem, calc(0.75rem + 2.25vw), 3.4rem)",
              color: "#e1dfd8",
              lineHeight: 1.06,
              letterSpacing: "-0.01em",
              marginBottom: "clamp(0.5000rem, 1.2vw, 0.875rem)",
              opacity: seen ? 1 : 0,
              transform: seen ? "none" : "translateY(36px)",
              transition: "opacity 0.95s ease 260ms, transform 0.95s cubic-bezier(0.22,1,0.36,1) 260ms",
            }}
          >
            Let&rsquo;s make something great.
          </h2>

          <p
            className="font-futura"
            style={{
              fontSize: "0.75rem",
              color: "rgba(225,223,216,0.45)",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              marginBottom: 0,
              opacity: seen ? 1 : 0,
              transform: seen ? "none" : "translateY(20px)",
              transition: "opacity 0.9s ease 380ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) 380ms",
            }}
          >
            Prague-based UX designer
          </p>

          <div style={{
            width: seen ? 40 : 0,
            height: 1,
            background: "rgba(225,223,216,0.18)",
            margin: isMobile
              ? "clamp(1.125rem, 3vw, 1.75rem) auto"
              : "clamp(1.125rem, 3vw, 1.75rem) 0",
            transition: "width 1s cubic-bezier(0.22,1,0.36,1) 480ms",
          }} />

          <FooterCTA isVisible={seen} />
        </div>
      </div>
    </div>
  );
}
