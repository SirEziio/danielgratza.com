"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import { CaseStudy, CaseStudyChapter } from "@/lib/types";
import { PortfolioItem, caseStudies } from "@/lib/data";
import PillCTA from "@/components/PillCTA";

/* ─────────────────────────────────────────────────────────────────
   useInView — fires once when element enters the viewport
───────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─────────────────────────────────────────────────────────────────
   FadeUp wrapper — children animate in when section enters view
───────────────────────────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(32px)",
        transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SectionGallery — slides through images, dot indicator, hover chevrons
───────────────────────────────────────────────────────────────── */
function SectionGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  const go = (dir: number) => {
    setCurrent((prev) => (prev + dir + count) % count);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (!count) return null;

  const chevronBtn: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(36,36,36,0.1)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    color: "rgba(36,36,36,0.8)",
    transition: "opacity 250ms ease, background 200ms ease",
  };

  return (
    <div
      style={{ userSelect: "none", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image viewport */}
      <div
        style={{ position: "relative", overflow: "hidden", aspectRatio: "3/2" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sliding strip */}
        <div
          style={{
            display: "flex",
            height: "100%",
            width: `${count * 100}%`,
            transform: `translateX(-${(current / count) * 100}%)`,
            transition: "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              style={{ position: "relative", width: `${100 / count}%`, flexShrink: 0 }}
            >
              <Image
                src={src}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 840px) 100vw, 60vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Left chevron — half outside the image */}
      {count > 1 && (
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          style={{
            ...chevronBtn,
            left: -20,
            opacity: hovered ? 1 : 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Right chevron — half outside the image */}
      {count > 1 && (
        <button
          onClick={() => go(1)}
          aria-label="Next"
          style={{
            ...chevronBtn,
            right: -20,
            opacity: hovered ? 1 : 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 7,
            paddingTop: 14,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Photo ${i + 1}`}
              style={{
                width: i === current ? 8 : 6,
                height: i === current ? 8 : 6,
                borderRadius: "50%",
                background: "var(--ink)",
                opacity: i === current ? 0.7 : 0.2,
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 280ms ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Section label — small ALL CAPS futura eyebrow
───────────────────────────────────────────────────────────────── */
function Eyebrow({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <p
      className="font-futura"
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: light ? "rgba(225,223,216,0.45)" : "var(--ink-faint)",
        marginBottom: 16,
      }}
    >
      {text}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Helper — section wrapper with consistent horizontal padding
───────────────────────────────────────────────────────────────── */
const sectionPad: React.CSSProperties = {
  padding: "clamp(4rem, 10vw, 7.5000rem) max(var(--page-pad), max(var(--page-pad), clamp(24px, 6vw, 80px)))",
  maxWidth: 1100,
  margin: "0 auto",
  width: "100%",
};

/* ─────────────────────────────────────────────────────────────────
   1. HERO SECTION
───────────────────────────────────────────────────────────────── */
function HeroSection({
  study,
  portfolio,
  heroRef,
}: {
  study: CaseStudy;
  portfolio: PortfolioItem | undefined;
  heroRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={heroRef as React.RefObject<HTMLElement>}
      style={{
        minHeight: "100dvh",
        background: "#1a1e15",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated grid */}
      <GridBackground forceDark />

      {/* Cover image with dark gradient overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      >
        <Image
          src={study.coverImage || "/images/cs-arma4-cover.png"}
          alt=""
          fill
          style={{ objectFit: "cover", opacity: 1 }}
          priority
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              `linear-gradient(to top,    rgba(16,18,14,0.96) 0%,  rgba(16,18,14,0.55) 40%, transparent 65%),
               linear-gradient(to right,  rgba(16,18,14,0.88) 0%,  rgba(16,18,14,0.60) 38%, rgba(16,18,14,0.10) 62%, transparent 75%),
               linear-gradient(135deg,    rgba(16,18,14,0.45) 0%,  transparent 55%)`,
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "max(120px, calc(80px + env(safe-area-inset-top, 0px))) max(var(--page-pad), clamp(1.5rem, 6vw, 5.0000rem)) 80px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* App icon */}
        {portfolio?.iconSrc && (
          <div
            style={{
              marginBottom: 28,
              width: 52,
              height: 52,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: portfolio.iconBg ?? "#2D3626",
              flexShrink: 0,
            }}
          >
            <Image
              src={portfolio.iconSrc}
              alt={study.title}
              width={52}
              height={52}
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        {/* Eyebrow */}
        <Eyebrow text="Case Study" light />

        {/* Title */}
        <h1
          className="font-caslon"
          style={{
            fontSize: "clamp(2.5rem, calc(1.5rem + 3.5vw), 5.375rem)",
            color: "rgba(225,223,216,0.95)",
            lineHeight: 1.0,
            letterSpacing: "0.01em",
            marginBottom: 20,
            maxWidth: 820,
          }}
        >
          {study.title}
        </h1>

        {/* Subtitle */}
        <p
          className="font-futura"
          style={{
            fontSize: "1rem",
            color: "rgba(225,223,216,0.82)",
            fontWeight: 400,
            marginBottom: 40,
            maxWidth: 560,
            lineHeight: 1.65,
          }}
        >
          {study.subtitle}
        </p>

        {/* Role / Year tags — always on dark hero, force light variant */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[study.role, String(study.year)].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="portfolio-tag"
              style={{
                color: "rgba(225,223,216,0.6)",
                borderColor: "rgba(225,223,216,0.3)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   2. META STRIP
───────────────────────────────────────────────────────────────── */
const TOOL_ICON: Record<string, string> = {
  "figma":           "/icons/tools/figma.svg",
  "framer":          "/icons/tools/framer.svg",
  "optimizely":      "/icons/tools/optimizely.svg",
  "ga4":             "/icons/tools/ga4.svg",
  "adobe cc":        "/icons/tools/adobe-cc.svg",
  "photoshop":       "/icons/tools/photoshop.svg",
  "illustrator":     "/icons/tools/illustrator.svg",
  "indesign":        "/icons/tools/indesign.svg",
  "maze":            "/icons/tools/maze.svg",
  "jira":            "/icons/tools/jira.svg",
  "python":          "/icons/tools/python.svg",
  "firebase":        "/icons/tools/firebase.svg",
  "blender":         "/icons/tools/blender.svg",
  "miro":            "/icons/tools/miro.svg",
  "unity":           "/icons/tools/unity.svg",
  "claude":          "/icons/tools/Claude.svg",
};

function getToolIcon(name: string): string | null {
  return TOOL_ICON[name.toLowerCase().trim()] ?? null;
}

function MetaStrip({ study }: { study: CaseStudy }) {
  const toolList = (study.tools || "Figma").split("·").map((t) => t.trim()).filter(Boolean);

  const metaItems = [
    { label: "Role",     value: study.role || "UX Designer" },
    { label: "Timeline", value: study.timeline || "—" },
    { label: "Platform", value: "Desktop / Mobile" },
  ];

  return (
    <section
      style={{
        background: "rgba(36,36,36,0.04)",
        borderTop: "1px solid var(--grid-line)",
        borderBottom: "1px solid var(--grid-line)",
      }}
    >
      <div
        style={{
          ...sectionPad,
          padding: "clamp(1.75rem, 4vw, 3rem) max(var(--page-pad), clamp(24px, 6vw, 80px))",
        }}
      >
        <div
          className="cs-meta-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 2fr",
            gap: "clamp(1.5rem, 4vw, 3rem)",
          }}
        >
          {metaItems.map((item) => (
            <FadeUp key={item.label}>
              <p
                className="font-futura"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--ink-faint)",
                  marginBottom: 8,
                }}
              >
                {item.label}
              </p>
              <p
                className="font-futura"
                style={{
                  fontSize: "1rem",
                  color: "var(--ink)",
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                {item.value}
              </p>
            </FadeUp>
          ))}

          {/* Tools — icons + names */}
          <div className="cs-meta-tools"><FadeUp>
            <p
              className="font-futura"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-faint)",
                marginBottom: 8,
              }}
            >
              Tools
            </p>
            <div style={{ display: "flex", flexWrap: "nowrap", gap: "8px 16px" }}>
              {toolList.map((tool) => {
                const icon = getToolIcon(tool);
                return (
                  <div key={tool} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {icon && (
                      <img
                        src={icon}
                        alt={tool}
                        width={16}
                        height={16}
                        style={{ flexShrink: 0, objectFit: "contain" }}
                      />
                    )}
                    <span
                      className="font-futura"
                      style={{
                        fontSize: "1rem",
                        color: "var(--ink)",
                        fontWeight: 400,
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tool}
                    </span>
                  </div>
                );
              })}
            </div>
          </FadeUp></div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   3. OVERVIEW / CHALLENGE
───────────────────────────────────────────────────────────────── */
function OverviewSection({ chapters }: { chapters: CaseStudyChapter[] }) {
  // Pull text from the first overview block found across chapters
  const overviewBlock = chapters
    .flatMap((ch) => ch.blocks)
    .find((b) => b.type === "overview");

  const bodyText =
    overviewBlock?.type === "overview"
      ? overviewBlock.leftText
      : "A deep dive into designing military-grade UI for one of the most technically demanding game environments in the industry. The challenge was balancing realism with usability under high-pressure scenarios.";

  return (
    <section style={{ background: "var(--bg)" }}>
      <div style={sectionPad}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(2.5rem, 6vw, 5.0000rem)",
            alignItems: "center",
          }}
        >
          {/* Left — text */}
          <FadeUp>
            <Eyebrow text="Overview" />
            <h2
              className="font-caslon"
              style={{
                fontSize: "clamp(1.75rem, calc(0.75rem + 2vw), 3rem)",
                color: "var(--ink)",
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              The Challenge
            </h2>
            <p
              className="font-futura"
              style={{
                fontSize: "1rem",
                color: "var(--ink)",
                lineHeight: 1.8,
                fontWeight: 400,
                opacity: 0.8,
                whiteSpace: "pre-line",
              }}
            >
              {bodyText}
            </p>
          </FadeUp>

          {/* Right — image */}
          <FadeUp delay={120}>
            <div
              style={{
                borderRadius: 0,
                overflow: "hidden",
                aspectRatio: "3 / 2",
                position: "relative",
              }}
            >
              <Image
                src="/images/cs-arma4-1.jpg"
                alt="Case study detail"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   4. RESEARCH
───────────────────────────────────────────────────────────────── */
function ResearchSection({ chapters, study }: { chapters: CaseStudyChapter[]; study: CaseStudy }) {
  // Pull findings from any two-col-findings block
  const findingsBlock = chapters
    .flatMap((ch) => ch.blocks)
    .find((b) => b.type === "two-col-findings");

  const findings =
    findingsBlock?.type === "two-col-findings"
      ? findingsBlock.findings.slice(0, 3)
      : [
          { num: "01", text: "Players need real-time feedback without breaking immersion" },
          { num: "02", text: "Inventory management is a critical bottleneck under stress" },
          { num: "03", text: "Military conventions shape mental models; deviate at your peril" },
        ];

  // Gallery: first image-row block across all chapters
  const firstImageRow = chapters
    .flatMap((ch) => ch.blocks)
    .find((b) => b.type === "image-row");
  const galleryImages =
    firstImageRow?.type === "image-row"
      ? firstImageRow.images
      : ["/images/cs-arma4-1.jpg", "/images/cs-arma4-2.jpg", "/images/cs-arma4-3.jpg"];

  return (
    <section
      style={{ background: "var(--bg)", borderTop: "1px solid var(--grid-line)" }}
    >
      <div style={sectionPad}>
        <FadeUp>
          <Eyebrow text="Research & Discovery" />
          <h2
            className="font-caslon"
            style={{
              fontSize: "clamp(1.75rem, calc(0.75rem + 2vw), 3rem)",
              color: "var(--ink)",
              lineHeight: 1.1,
              marginBottom: 48,
            }}
          >
            Key Findings
          </h2>
        </FadeUp>

        {/* Finding glassy cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 56 }}>
          {findings.map((f, i) => (
            <FadeUp key={f.num} delay={i * 80}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 24px",
                  borderRadius: 0,
                  background: "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(36,36,36,0.08)",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(36,36,36,0.16)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(36,36,36,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(36,36,36,0.08)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <span
                  className="font-futura"
                  style={{
                    fontSize: "clamp(1.0625rem, calc(0.5rem + 0.8vw), 1.3125rem)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: study.accentColor,
                    opacity: 0.85,
                    flexShrink: 0,
                    width: 36,
                    textAlign: "right",
                  }}
                >
                  {f.num}
                </span>
                <p
                  className="font-futura"
                  style={{
                    fontSize: "clamp(1.0625rem, calc(0.5rem + 0.9vw), 1.5rem)",
                    color: "var(--ink)",
                    lineHeight: 1.45,
                    fontWeight: 400,
                    margin: 0,
                  }}
                >
                  {f.text}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Research — gallery */}
        <FadeUp delay={200}>
          <SectionGallery images={galleryImages} />
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   5. PROCESS
───────────────────────────────────────────────────────────────── */
const PROCESS_STEPS = ["Define", "Research", "Analyze", "Design", "Test"];

function ProcessSection({ chapters }: { chapters: CaseStudyChapter[] }) {
  // Pull two-col-text block for ideation text
  const textBlock = chapters
    .flatMap((ch) => ch.blocks)
    .find((b) => b.type === "two-col-text");

  const leftText =
    textBlock?.type === "two-col-text"
      ? textBlock.leftText
      : "We started by mapping the existing Arma 3 inventory to identify friction points and quantify the cognitive load placed on players during combat scenarios.";

  const rightText =
    textBlock?.type === "two-col-text"
      ? textBlock.rightText
      : "Multiple rounds of wireframing followed, testing different organizational hierarchies, drag-and-drop interactions, and contextual quick-actions before arriving at the final system.";

  // Gallery: second image-row block across all chapters (process images)
  const allImageRows = chapters
    .flatMap((ch) => ch.blocks)
    .filter((b) => b.type === "image-row");
  const processImageRow = allImageRows[1] ?? allImageRows[0];
  const galleryImages =
    processImageRow?.type === "image-row"
      ? processImageRow.images
      : ["/images/cs-arma4-4.jpg", "/images/cs-arma4-5.jpg", "/images/cs-arma4-6.jpg"];

  return (
    <section
      style={{ background: "var(--bg)", borderTop: "1px solid var(--grid-line)" }}
    >
      <div style={sectionPad}>
        <FadeUp>
          <Eyebrow text="Design Process" />
          <h2
            className="font-caslon"
            style={{
              fontSize: "clamp(1.75rem, calc(0.75rem + 2vw), 3rem)",
              color: "var(--ink)",
              lineHeight: 1.1,
              marginBottom: 48,
            }}
          >
            How We Got There
          </h2>
        </FadeUp>

        {/* Horizontal step flow */}
        <FadeUp delay={80}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              flexWrap: "wrap",
              marginBottom: 56,
            }}
          >
            {PROCESS_STEPS.map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 clamp(0.75rem, 2vw, 1.75rem)",
                  }}
                >
                  {/* Step circle */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid var(--grid-line)",
                      background: "rgba(36,36,36,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="font-futura"
                      style={{
                        fontSize: 11,
                        color: "var(--ink-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <span
                    className="font-futura"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink-faint)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step}
                  </span>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <svg
                    width="20"
                    height="2"
                    viewBox="0 0 20 2"
                    aria-hidden
                    style={{ flexShrink: 0, marginBottom: 28 }}
                  >
                    <line
                      x1="0"
                      y1="1"
                      x2="20"
                      y2="1"
                      stroke="var(--grid-line)"
                      strokeWidth="1"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Two-column ideation text */}
        <FadeUp delay={160}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "clamp(1.5rem, 4vw, 3.5000rem)",
              marginBottom: 56,
            }}
          >
            <div>
              <p
                className="font-futura"
                style={{
                  fontSize: "1rem",
                  color: "var(--ink)",
                  lineHeight: 1.8,
                  fontWeight: 400,
                  opacity: 0.8,
                }}
              >
                {leftText}
              </p>
            </div>
            <div>
              <p
                className="font-futura"
                style={{
                  fontSize: "1rem",
                  color: "var(--ink)",
                  lineHeight: 1.8,
                  fontWeight: 400,
                  opacity: 0.8,
                }}
              >
                {rightText}
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Process — gallery */}
        <FadeUp delay={240}>
          <SectionGallery images={galleryImages} />
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   6. SOLUTION / FINAL DESIGN
───────────────────────────────────────────────────────────────── */
function SolutionSection({ study }: { study: CaseStudy }) {
  const featureCards = [
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      title: "Layered Inventory",
      desc: "A tiered system separating quick-access slots from long-term storage, reducing cognitive overhead in combat.",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      ),
      title: "Contextual Actions",
      desc: "Right-click interactions surface only the relevant actions for each item type, minimising UI noise.",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      title: "Grid Snap System",
      desc: "Tetris-style grid placement communicates weight and bulk realistically without sacrificing usability.",
    },
  ];

  return (
    <section
      style={{ background: "var(--bg)", borderTop: "1px solid var(--grid-line)" }}
    >
      <div style={sectionPad}>
        <FadeUp>
          <Eyebrow text="Final Design" />
          <h2
            className="font-caslon"
            style={{
              fontSize: "clamp(1.75rem, calc(0.75rem + 2vw), 3rem)",
              color: "var(--ink)",
              lineHeight: 1.1,
              marginBottom: 40,
            }}
          >
            The Solution
          </h2>
        </FadeUp>

        {/* Hero solution image */}
        <FadeUp delay={80}>
          <div
            style={{
              borderRadius: 0,
              overflow: "hidden",
              aspectRatio: "3/2",
              position: "relative",
              marginBottom: 48,
            }}
          >
            <Image
              src={study.coverImage || "/images/cs-arma4-cover.png"}
              alt="Final design"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </FadeUp>

        {/* Feature cards — dark glassy */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {featureCards.map((card, i) => (
            <FadeUp key={card.title} delay={i * 80}>
              <div
                style={{
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(36,36,36,0.08)",
                  borderLeft: `3px solid ${study.accentColor}`,
                  borderRadius: 0,
                  padding: "40px 36px 36px",
                  height: "100%",
                  transition: "box-shadow 0.25s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(36,36,36,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    color: "var(--ink-faint)",
                    marginBottom: 22,
                  }}
                >
                  {card.icon}
                </div>
                <p
                  className="font-futura"
                  style={{
                    fontSize: "clamp(1.0625rem, calc(0.5rem + 0.7vw), 1.3125rem)",
                    color: "var(--ink)",
                    fontWeight: 600,
                    marginBottom: 14,
                    letterSpacing: "0.01em",
                  }}
                >
                  {card.title}
                </p>
                <p
                  className="font-futura"
                  style={{
                    fontSize: "1rem",
                    color: "var(--ink-muted)",
                    lineHeight: 1.8,
                    fontWeight: 400,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   7. REFLECTION — dark bg
───────────────────────────────────────────────────────────────── */
function ReflectionSection({ chapters, study }: { chapters: CaseStudyChapter[]; study: CaseStudy }) {
  // Pull reflection text from blocks
  const reflectionBlock = chapters
    .flatMap((ch) => ch.blocks)
    .find((b) => b.type === "reflection");

  const takeawaysBlock = chapters
    .flatMap((ch) => ch.blocks)
    .find((b) => b.type === "metrics-takeaways");

  const reflectionText =
    reflectionBlock?.type === "reflection"
      ? reflectionBlock.text
      : takeawaysBlock?.type === "metrics-takeaways"
      ? takeawaysBlock.takeaways
      : "Designing for Arma 4 taught me that realism and usability aren't at odds — they require each other. The most immersive interface is the one that players never have to think about.";

  return (
    <section
      style={{
        background: "#111214",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent colour tint — subtle, keeps section always legible */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: study.accentColor,
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <GridBackground forceDark />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          ...sectionPad,
          padding: "clamp(5.0000rem, 12vw, 8.7500rem) max(var(--page-pad), clamp(24px, 6vw, 80px))",
        }}
      >
        <FadeUp>
          <Eyebrow text="Takeaways" light />
          <h2
            className="font-caslon"
            style={{
              fontSize: "clamp(1.75rem, calc(0.75rem + 2vw), 3.25rem)",
              color: "rgba(225,223,216,0.95)",
              lineHeight: 1.1,
              marginBottom: 40,
            }}
          >
            Reflection
          </h2>
        </FadeUp>

        <FadeUp delay={100}>
          {/* Quote */}
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                width: 32,
                height: 2,
                background: "rgba(225,223,216,0.2)",
                marginBottom: 32,
              }}
            />
            <p
              className="font-caslon"
              style={{
                fontSize: "clamp(1.375rem, calc(0.5rem + 1.75vw), 2.375rem)",
                color: "rgba(225,223,216,0.88)",
                lineHeight: 1.45,
                fontStyle: "italic",
                letterSpacing: "0.01em",
              }}
            >
              {reflectionText}
            </p>
          </div>
        </FadeUp>

        {/* Secondary image */}
        <FadeUp delay={200}>
          <div
            style={{
              marginTop: 56,
              borderRadius: 0,
              overflow: "hidden",
              aspectRatio: "3/2",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Image
              src="/images/cs-arma4-5.jpg"
              alt="Final design detail"
              fill
              style={{ objectFit: "cover", opacity: 0.8 }}
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   8. NEXT PROJECT — pagination
───────────────────────────────────────────────────────────────── */
function NextProjectSection({ study }: { study: CaseStudy }) {
  const router = useRouter();
  const idx = caseStudies.findIndex((c) => c.slug === study.slug);
  const prev = idx > 0 ? caseStudies[idx - 1] : null;
  const next = idx < caseStudies.length - 1 ? caseStudies[idx + 1] : null;

  const [backLabel, setBackLabel] = useState("Back to Portfolio");
  useEffect(() => {
    if (sessionStorage.getItem("caseStudySource") === "home") setBackLabel("Back to Homepage");
  }, []);

  return (
    <section style={{ background: "var(--bg)", borderTop: "1px solid var(--grid-line)" }}>
      <div
        style={{
          ...sectionPad,
          padding: "clamp(4rem, 10vw, 7.5000rem) max(var(--page-pad), clamp(24px, 6vw, 80px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 56,
        }}
      >
        {/* Prev / Next pagination */}
        {(prev || next) && (
          <FadeUp style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: prev && next ? "1fr 1fr" : "1fr",
                gap: 1,
                background: "var(--grid-line)",
                border: "1px solid var(--grid-line)",
              }}
            >
              {prev && (
                <Link
                  href={`/case-study/${prev.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "32px 36px",
                      background: "var(--bg)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      transition: "background 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg)";
                    }}
                  >
                    <span
                      className="font-futura"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--ink-faint)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Previous
                    </span>
                    <span
                      className="font-caslon"
                      style={{
                        fontSize: "clamp(1.125rem, calc(0.5rem + 1vw), 1.625rem)",
                        color: "var(--ink)",
                        lineHeight: 1.2,
                      }}
                    >
                      {prev.title}
                    </span>
                  </div>
                </Link>
              )}

              {next && (
                <Link
                  href={`/case-study/${next.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "32px 36px",
                      background: "var(--bg)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                      gap: 10,
                      transition: "background 0.2s ease",
                      cursor: "pointer",
                      height: "100%",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg)";
                    }}
                  >
                    <span
                      className="font-futura"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--ink-faint)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      Next
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span
                      className="font-caslon"
                      style={{
                        fontSize: "clamp(1.125rem, calc(0.5rem + 1vw), 1.625rem)",
                        color: "var(--ink)",
                        lineHeight: 1.2,
                      }}
                    >
                      {next.title}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </FadeUp>
        )}

        {/* Back button + optional "View all projects" grouped together */}
        <FadeUp delay={100}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            {backLabel === "Back to Homepage" && (
              <Link
                href="/portfolio"
                className="font-futura"
                style={{
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
              >
                View all projects
              </Link>
            )}
            <PillCTA onClick={() => router.back()} label={backLabel} />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────────── */
export default function CaseStudyV2({
  study,
  chapters,
  portfolio,
}: {
  study: CaseStudy;
  chapters: CaseStudyChapter[];
  portfolio?: PortfolioItem;
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Update theme-color meta to match status bar area
  const setThemeColor = useCallback((color: string) => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!tag) { tag = document.createElement("meta"); tag.name = "theme-color"; document.head.appendChild(tag); }
    tag.content = color;
  }, []);

  // Track scroll to know when nav should flip from dark→light mode
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const past = !entry.isIntersecting;
        setScrolledPastHero(past);
        // Match status bar to hero bg or page bg depending on position
        const isDark = document.documentElement.classList.contains("dark");
        setThemeColor(past ? (isDark ? "#242424" : "#e1dfd8") : "#1a1a1a");
      },
      { threshold: 0.1 }
    );
    obs.observe(hero);
    setThemeColor("#1a1a1a");
    return () => { obs.disconnect(); };
  }, [setThemeColor]);

  return (
    <>
      {/* Navigation — lightNav while in the dark hero, normal after */}
      <Navigation lightNav={!scrolledPastHero} scrolledPastHero={scrolledPastHero} />

      <main>
        {/* 1 — Hero */}
        <HeroSection study={study} portfolio={portfolio} heroRef={heroRef} />

        {/* 2 — Meta strip */}
        <MetaStrip study={study} />

        {/* 3 — Overview / Challenge */}
        <OverviewSection chapters={chapters} />

        {/* 4 — Research */}
        <ResearchSection chapters={chapters} study={study} />

        {/* 5 — Process */}
        <ProcessSection chapters={chapters} />

        {/* 6 — Solution */}
        <SolutionSection study={study} />

        {/* 7 — Reflection (dark) */}
        <ReflectionSection chapters={chapters} study={study} />

        {/* 8 — Next project */}
        <NextProjectSection study={study} />
      </main>
    </>
  );
}
