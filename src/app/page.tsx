"use client";

import { useRef, useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import BouncingBall from "@/components/BouncingBall";
import MouseScrollIcon from "@/components/MouseScrollIcon";
import { caseStudies, portfolioItems } from "@/lib/data";
import DotGrid from "@/components/DotGrid";

const tagsMap = Object.fromEntries(portfolioItems.map(p => [p.slug, p.tags]));

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [seenSections, setSeenSections] = useState<Set<number>>(new Set());
  // Hero lazy-load stages: 0=hidden, 1=grid, 2=name, 3=subtitle, 4=ball+scroll
  const [heroStage, setHeroStage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 840);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setHeroStage(1), 80);   // grid
    const t2 = setTimeout(() => setHeroStage(2), 320);  // name
    const t3 = setTimeout(() => setHeroStage(3), 560);  // subtitle
    const t4 = setTimeout(() => setHeroStage(4), 780);  // ball + scroll
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

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
        />
      </div>

      {/* Scroll progress dots */}
      <div
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "0.45rem",
          zIndex: 50,
          pointerEvents: "auto",
        }}
      >
        {[0, ...caseStudies.map((_, i) => i + 1)].map((i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            style={{
              width: activeSection === i ? 7 : 5,
              height: activeSection === i ? 7 : 5,
              borderRadius: "50%",
              background: "var(--ink)",
              opacity: activeSection === i ? 0.8 : 0.2,
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.25s ease",
            }}
            aria-label={`Section ${i + 1}`}
          />
        ))}
      </div>

      <div ref={containerRef} className="snap-container">

        {/* ── SECTION 0: Hero ─────────────────────────────── */}
        <div className="snap-section" data-idx={0}>
          {/* Grid — fades in first */}
          <div style={{
            opacity: heroStage >= 1 ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}>
            <GridBackground />
          </div>

          {/* Bouncing ball — appears last */}
          <div style={{
            opacity: heroStage >= 4 ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}>
            <BouncingBall />
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
                fontSize: "clamp(4rem, 9vw, 8.5rem)",
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
                fontSize: "clamp(1.2rem, 2.5vw, 3rem)",
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
                    style={{ textDecoration: "none", display: "block", ...walkin(isSeen, 90) }}
                  >
                    <h2
                      className="font-caslon"
                      style={{
                        fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
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
                      fontSize: "clamp(16px, 1.35vw, 19px)",
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
                  <a href={`/case-study/${study.slug}`} style={{ display: "block" }}>
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
      </div>
    </>
  );
}
