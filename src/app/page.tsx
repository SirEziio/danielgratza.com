"use client";

import { useRef, useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import SolarSystem from "@/components/SolarSystem";
import MouseScrollIcon from "@/components/MouseScrollIcon";
import { caseStudies, portfolioItems } from "@/lib/data";
import DotGrid from "@/components/DotGrid";

/* ── Footer CTA ── */
function FooterCTA({ isVisible }: { isVisible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const fg         = "#e1dfd8";
  const borderBase = "rgba(225,223,216,0.22)";
  const borderHov  = "rgba(225,223,216,0.65)";
  const bgHov      = "rgba(225,223,216,0.07)";
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

/* ── Footer photo — full-screen tilt + occasional glitch ── */
function FooterPhoto({
  isVisible, tilt, glitching,
}: { isVisible: boolean; tilt: { x: number; y: number }; glitching: boolean }) {
  const faceBg  = "linear-gradient(145deg,#2c2c2c 0%,#3a3a3a 55%,#272727 100%)";
  const ring    = "rgba(255,255,255,0.12)";
  const bracket = "rgba(225,223,216,0.35)";

  const CORNERS: [string, string][] = [["top","left"],["top","right"],["bottom","left"],["bottom","right"]];

  return (
    <div style={{
      flexShrink: 0,
      position: "relative",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "none" : "translateY(24px) scale(0.88)",
      transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 80ms, transform 1.2s cubic-bezier(0.22,1,0.36,1) 80ms",
    }}>

      {/* Float wrapper — brackets live inside so they bob with the photo */}
      <div style={{ position: "relative", animation: isVisible ? "footerFloat 5s ease-in-out 1.5s infinite" : "none" }}>

        {/* Corner reticle brackets */}
        {CORNERS.map(([v, h]) => (
          <div key={`${v}-${h}`} style={{
            position: "absolute",
            [v]: -12, [h]: -12,
            width: 16, height: 16,
            borderTop:    v === "top"    ? `1px solid ${bracket}` : "none",
            borderBottom: v === "bottom" ? `1px solid ${bracket}` : "none",
            borderLeft:   h === "left"   ? `1px solid ${bracket}` : "none",
            borderRight:  h === "right"  ? `1px solid ${bracket}` : "none",
            animation: isVisible ? `bracketPulse ${2.2 + CORNERS.indexOf([v,h]) * 0.4}s ease-in-out infinite` : "none",
            pointerEvents: "none", zIndex: 3,
          }} />
        ))}

        {/* Tilt wrapper — driven by parent's footerTilt prop */}
        <div style={{
          transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.08s linear",
        }}>

          {/* Glitch + visual layer */}
          <div style={{
            width:  "clamp(8.7500rem, 18vw, 13.7500rem)",
            height: "clamp(8.7500rem, 18vw, 13.7500rem)",
            borderRadius: "50%",
            background: faceBg,
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px ${ring}`,
            animation: glitching ? "photoGlitch 0.45s steps(4, end) forwards" : "none",
          }}>
            <img
              src="/images/daniel.png"
              alt="Daniel Gratza"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

const tagsMap = Object.fromEntries(portfolioItems.map(p => [p.slug, p.tags]));

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [seenSections, setSeenSections] = useState<Set<number>>(new Set());
  // Hero lazy-load stages: 0=hidden, 1=grid, 2=name, 3=subtitle, 4=ball+scroll
  const [heroStage, setHeroStage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [footerTilt, setFooterTilt]       = useState({ x: 0, y: 0 });
  const [footerMousePx, setFooterMousePx] = useState({ x: 0, y: 0 });
  const [footerGlitch, setFooterGlitch]   = useState(false);
  const footerIdx = caseStudies.length + 1;
  const isFooterSeen = seenSections.has(footerIdx);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 840);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Full-screen tilt — active only when footer is the current section
  useEffect(() => {
    if (activeSection !== footerIdx) {
      setFooterTilt({ x: 0, y: 0 });
      return;
    }
    const handler = (e: MouseEvent) => {
      const dx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setFooterTilt({ x: dy * -16, y: dx * 16 });
      setFooterMousePx({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [activeSection, footerIdx]);

  // Occasional glitch — starts after footer first appears
  useEffect(() => {
    if (!isFooterSeen) return;
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setFooterGlitch(true);
        setTimeout(() => setFooterGlitch(false), 450);
        schedule();
      }, 8000 + Math.random() * 10000);
    };
    schedule();
    return () => clearTimeout(t);
  }, [isFooterSeen]);

  useEffect(() => {
    const t1 = setTimeout(() => setHeroStage(1), 80);   // grid
    const t2 = setTimeout(() => setHeroStage(2), 320);  // name
    const t3 = setTimeout(() => setHeroStage(3), 560);  // subtitle
    const t4 = setTimeout(() => setHeroStage(4), 780);  // ball + scroll
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Sync theme-color meta with current section for iOS status bar
  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!tag) { tag = document.createElement("meta"); tag.name = "theme-color"; document.head.appendChild(tag); }
    const isFooter = activeSection === footerIdx;
    tag.content = isFooter ? "#1a1a1a" : (isDark ? "#242424" : "#e1dfd8");
  }, [activeSection, isDark, footerIdx]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLDivElement>(".snap-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx ?? 0);
            setActiveSection(idx);
            if (idx > 0) {
              setSeenSections((prev) => {
                if (prev.has(idx)) return prev;
                const next = new Set(prev);
                next.add(idx);
                return next;
              });
            }
          }
        });
      },
      { root: container, threshold: 0.45 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollToNext = () => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLDivElement>(".snap-section");
    sections[1]?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollTo = (idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLDivElement>(".snap-section");
    sections[idx]?.scrollIntoView({ behavior: "smooth" });
  };

  // Text: fades + rises from below — starts immediately
  const TEXT_DELAY = 0;
  const walkin = (isSeen: boolean, delay = 0) => ({
    opacity: isSeen ? 1 : 0,
    transform: isSeen ? "none" : "translateY(26px)",
    transition: `opacity 0.6s ease ${TEXT_DELAY + delay}ms, transform 0.6s ease ${TEXT_DELAY + delay}ms`,
  });

  // Photo: slides in from the correct side, after text
  const PHOTO_DELAY = 380; // ms — fires after the last text element (320ms)
  const photoSlide = (isSeen: boolean, fromRight: boolean) => ({
    opacity: isSeen ? 1 : 0,
    transform: isSeen ? "none" : `translateX(${fromRight ? "60px" : "-60px"})`,
    transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${PHOTO_DELAY}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${PHOTO_DELAY}ms`,
  });

  return (
    <>
      <div style={{
        opacity: activeSection > 0 || heroStage >= 4 ? 1 : 0,
        transition: "opacity 0.7s ease",
        pointerEvents: activeSection > 0 || heroStage >= 4 ? "auto" : "none",
      }}>
        <Navigation
          hideLogo={activeSection === 0}
          scrolledPastHero={activeSection > 0}
          lightNav={activeSection === footerIdx}
        />
      </div>

      {/* Scroll progress dots — hidden on hero */}
      <div
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          zIndex: 50,
          pointerEvents: activeSection === 0 ? "none" : "auto",
          opacity: activeSection === 0 ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        {[0, ...caseStudies.map((_, i) => i + 1), caseStudies.length + 1].map((i) => {
          const onDark = activeSection === caseStudies.length + 1;
          const dotColor = onDark ? "#e1dfd8" : "var(--ink)";
          const isActive = activeSection === i;
          return (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Section ${i + 1}`}
              style={{
                width: 12, height: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: "none",
                padding: 0, cursor: "pointer", flexShrink: 0,
              }}
            >
              <span style={{
                display: "block",
                width:  isActive ? 8 : 5,
                height: isActive ? 8 : 5,
                borderRadius: 0,
                transform: "rotate(45deg)",
                background: isActive ? dotColor : "transparent",
                border:     isActive ? "none" : `1.5px solid ${dotColor}`,
                opacity:    isActive ? 0.90 : 0.28,
                transition: "all 0.25s ease",
                flexShrink: 0,
              }} />
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="snap-container">

        {/* ── SECTION 0: Hero ─────────────────────────────── */}
        <div className="snap-section" data-idx={0}>
          {/* Grid — fades in first */}
          <div style={{
            opacity: heroStage >= 1 ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}>
            <GridBackground interactive={false} />
          </div>

          {/* Solar system — appears last */}
          <div style={{
            opacity: heroStage >= 4 ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}>
            <SolarSystem />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              pointerEvents: "none",
              textAlign: "center",
              gap: "0.6rem",
            }}
          >
            {/* Name */}
            <h1
              className="font-caslon hero-title"
              style={{
                fontSize: "clamp(4rem, calc(2rem + 5vw), 8.5rem)",
                color: "var(--ink)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                opacity: heroStage >= 2 ? 1 : 0,
                transform: heroStage >= 2 ? "none" : "translateY(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              Daniel Gratza
            </h1>
            {/* Subtitle */}
            <p
              className="font-futura"
              style={{
                fontSize: "clamp(1.2rem, calc(0.75rem + 1.25vw), 3rem)",
                fontWeight: 300,
                color: "var(--ink)",
                letterSpacing: "0.04em",
                opacity: heroStage >= 3 ? 1 : 0,
                transform: heroStage >= 3 ? "none" : "translateY(16px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              UX Designer
            </p>
          </div>

          {/* Scroll indicator — appears with ball */}
          <div
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              opacity: heroStage >= 4 ? 1 : 0,
              transition: "opacity 0.7s ease",
            }}
          >
            <MouseScrollIcon onClick={scrollToNext} />
          </div>
        </div>

        {/* ── SECTIONS 1+: Case studies ───────────────────── */}
        {caseStudies.map((study, i) => {
          const isSeen = seenSections.has(i + 1);
          const bg = i % 2 === 0 ? "var(--bg-card)" : "var(--bg)";

          return (
            <div
              key={study.slug}
              className="snap-section"
              data-idx={i + 1}
              style={{
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Dot grid — desktop: covers image half; mobile: left 20% strip, odd sections only */}
              {(!isMobile || i % 2 === 1) && (() => {
                const side = isMobile ? "left" : (i % 2 === 0 ? "right" : "left");
                return (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      [side]: 0,
                      width: isMobile ? "20%" : "50%",
                      zIndex: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <DotGrid />
                  </div>
                );
              })()}

              <div className="cs-section-inner" style={{ position: "relative", zIndex: 1,
                flexDirection: i % 2 === 1 ? "row-reverse" : "row",
                gap: "8vw",
                paddingLeft:  i % 2 === 0 ? "7vw" : "6vw",
                paddingRight: i % 2 === 0 ? "6vw" : "7vw",
                paddingTop: isMobile ? "8rem" : "4rem",
                paddingBottom: "4rem",
              }}>
                {/* Left — text, staggered walk-in */}
                <div className="cs-text-col" style={{ flex: "0 0 36%", maxWidth: 400 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: "0.75rem",
                      ...walkin(isSeen, 0),
                    }}
                  >
                    {(tagsMap[study.slug] ?? []).map(tag => (
                      <span key={tag} className="portfolio-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`/case-study/${study.slug}`}
                    onClick={() => sessionStorage.setItem("caseStudySource", "home")}
                    style={{ textDecoration: "none", display: "block", ...walkin(isSeen, 90) }}
                  >
                    <h2
                      className="font-caslon"
                      style={{
                        fontSize: "clamp(2rem, calc(0.75rem + 2vw), 3.2rem)",
                        color: "var(--ink)",
                        lineHeight: 1.05,
                        marginBottom: "1rem",
                        cursor: "pointer",
                      }}
                    >
                      {study.title}
                    </h2>
                  </a>

                  <p
                    className="font-futura"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 400,
                      color: "var(--ink-muted)",
                      lineHeight: 1.8,
                      marginBottom: "2rem",
                      ...walkin(isSeen, 170),
                    }}
                  >
                    {study.subtitle}
                  </p>

                  <div
                    style={{
                      borderTop: "1px solid rgba(36,36,36,0.1)",
                      paddingTop: "1.25rem",
                      display: "flex",
                      gap: "2rem",
                      marginBottom: "2rem",
                      ...walkin(isSeen, 250),
                    }}
                  >
                    {[
                      { label: "Role", value: study.role },
                      { label: "Timeline", value: study.timeline },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p
                          className="font-futura"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "var(--ink-faint)",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          className="font-futura"
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 400,
                            color: "var(--ink)",
                          }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", ...walkin(isSeen, 320) }}>
                    <a
                      href={`/case-study/${study.slug}`}
                      onClick={() => sessionStorage.setItem("caseStudySource", "home")}
                      className="nav-link"
                      style={{
                        fontSize: "1rem",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                      }}
                    >
                      View case study →
                    </a>
                  </div>
                </div>

                {/* Cover photo — slides in after text */}
                <div
                  className="cs-card-col"
                  style={{
                    flex: 1,
                    ...(isMobile ? walkin(isSeen, PHOTO_DELAY) : photoSlide(isSeen, i % 2 === 0)),
                  }}
                >
                  <a href={`/case-study/${study.slug}`} onClick={() => sessionStorage.setItem("caseStudySource", "home")} style={{ display: "block" }}>
                    <img
                      src={study.coverImage}
                      alt={study.title}
                      className="cs-cover-img"
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "16/10",
                        borderRadius: 0,
                        display: "block",
                        objectFit: "cover",
                        objectPosition: "center",
                        cursor: "pointer",
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── FOOTER: About + Contact ───────────────────────── */}
        <div
          className="snap-section"
          data-idx={footerIdx}
          style={{
            background: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            transition: "background 0.35s ease",
          }}
        >
          {/* Breathing interactive grid — same component as hero/about */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <GridBackground forceDark={true} />
          </div>

          {/* Radar sweep — slow rotating conic gradient */}
          <div style={{
            position: "absolute",
            left: "50%", top: "50%",
            width: "max(150vw, 150vh)", height: "max(150vw, 150vh)",
            transform: "translate(-50%, -50%)",
            background: "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(225,223,216,0.02) 315deg, rgba(225,223,216,0.07) 348deg, rgba(225,223,216,0.14) 360deg)",
            animation: "radarSweep 8s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }} />

          {/* Ambient glow — breathes */}
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
              opacity: isFooterSeen ? 1 : 0,
              transition: "opacity 1.8s ease 100ms",
              animation: isFooterSeen ? "footerGlowPulse 4s ease-in-out 1.8s infinite" : "none",
            }} />
          </div>

          {/* Decorative + markers at fixed positions */}
          {[
            { left: "8%",  top: "18%" , delay: "0s"    },
            { left: "88%", top: "72%" , delay: "1.1s"  },
            { left: "12%", top: "78%" , delay: "2.3s"  },
            { left: "82%", top: "22%" , delay: "0.7s"  },
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


          {/* Mouse coordinate HUD — bottom right */}
          <div className="font-futura" style={{
            position: "absolute", bottom: "clamp(1rem, 2.5vw, 1.75rem)", right: "clamp(20px, 3vw, 36px)",
            fontSize: 9, letterSpacing: "0.1em",
            color: "rgba(225,223,216,0.28)",
            fontVariantNumeric: "tabular-nums",
            pointerEvents: "none", zIndex: 2, userSelect: "none",
            opacity: isFooterSeen ? 1 : 0,
            transition: "opacity 1s ease 1.2s",
          }}>
            {`${footerMousePx.x.toString(16).padStart(4,"0").toUpperCase()} · ${footerMousePx.y.toString(16).padStart(4,"0").toUpperCase()}`}
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

            {/* LEFT: Interactive photo */}
            <FooterPhoto isVisible={isFooterSeen} tilt={footerTilt} glitching={footerGlitch} />

            {/* RIGHT: Text block */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
              textAlign: isMobile ? "center" : "left",
            }}>
              {/* Headline */}
              <h2
                className="font-caslon"
                style={{
                  fontSize: "clamp(1.8rem, calc(0.75rem + 2.25vw), 3.4rem)",
                  color: "#e1dfd8",
                  lineHeight: 1.06,
                  letterSpacing: "-0.01em",
                  marginBottom: "clamp(0.5000rem, 1.2vw, 0.875rem)",
                  opacity: isFooterSeen ? 1 : 0,
                  transform: isFooterSeen ? "none" : "translateY(36px)",
                  transition: "opacity 0.95s ease 260ms, transform 0.95s cubic-bezier(0.22,1,0.36,1) 260ms",
                }}
              >
                Let&rsquo;s make something great.
              </h2>

              {/* Tagline */}
              <p
                className="font-futura"
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(225,223,216,0.45)",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  marginBottom: 0,
                  opacity: isFooterSeen ? 1 : 0,
                  transform: isFooterSeen ? "none" : "translateY(20px)",
                  transition: "opacity 0.9s ease 380ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) 380ms",
                }}
              >
                Prague-based UX designer
              </p>

              {/* Divider — grows from left (or centre on mobile) */}
              <div style={{
                width: isFooterSeen ? 40 : 0,
                height: 1,
                background: "rgba(225,223,216,0.18)",
                margin: isMobile
                  ? "clamp(1.125rem, 3vw, 1.75rem) auto"
                  : "clamp(1.125rem, 3vw, 1.75rem) 0",
                transition: "width 1s cubic-bezier(0.22,1,0.36,1) 480ms",
              }} />

              {/* CTA */}
              <FooterCTA isVisible={isFooterSeen} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
