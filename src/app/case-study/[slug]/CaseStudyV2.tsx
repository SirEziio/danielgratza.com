"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import { CaseStudy, CaseStudyChapter } from "@/lib/types";
import { PortfolioItem } from "@/lib/data";

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
  padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)",
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
              "linear-gradient(105deg, rgba(26,30,21,0.97) 0%, rgba(26,30,21,0.88) 28%, rgba(26,30,21,0.45) 55%, rgba(26,30,21,0.05) 75%, transparent 88%)",
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
          padding: "120px clamp(24px, 6vw, 80px) 80px",
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
            fontSize: "clamp(40px, 6vw, 86px)",
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
            fontSize: "clamp(15px, 1.4vw, 20px)",
            color: "rgba(225,223,216,0.82)",
            fontWeight: 400,
            marginBottom: 40,
            maxWidth: 560,
            lineHeight: 1.65,
          }}
        >
          {study.subtitle}
        </p>

        {/* Role / Year tags */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[study.role, String(study.year)].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="font-futura"
              style={{
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(225,223,216,0.6)",
                border: "1px solid rgba(225,223,216,0.15)",
                borderRadius: 0,
                padding: "6px 14px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: 1,
            height: 48,
            background:
              "linear-gradient(to bottom, transparent, rgba(225,223,216,0.3))",
          }}
        />
        <svg
          width="16"
          height="8"
          viewBox="0 0 16 8"
          fill="none"
          aria-hidden
        >
          <path
            d="M1 1l7 6 7-6"
            stroke="rgba(225,223,216,0.3)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   2. META STRIP
───────────────────────────────────────────────────────────────── */
function MetaStrip({ study }: { study: CaseStudy }) {
  const items = [
    { label: "Role", value: study.role || "UX Designer" },
    { label: "Timeline", value: study.timeline || "—" },
    { label: "Platform", value: "Desktop / Mobile" },
    { label: "Tools", value: study.tools || "Figma" },
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
          padding: "clamp(28px, 4vw, 48px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "clamp(24px, 4vw, 48px)",
          }}
        >
          {items.map((item) => (
            <FadeUp key={item.label}>
              <p
                className="font-futura"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  marginBottom: 8,
                }}
              >
                {item.label}
              </p>
              <p
                className="font-futura"
                style={{
                  fontSize: "clamp(14px, 1.2vw, 17px)",
                  color: "var(--ink)",
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                {item.value}
              </p>
            </FadeUp>
          ))}
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
            gap: "clamp(40px, 6vw, 80px)",
            alignItems: "center",
          }}
        >
          {/* Left — text */}
          <FadeUp>
            <Eyebrow text="Overview" />
            <h2
              className="font-caslon"
              style={{
                fontSize: "clamp(28px, 3.5vw, 48px)",
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
                fontSize: "clamp(16px, 1.35vw, 19px)",
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
                aspectRatio: "4 / 3",
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
function ResearchSection({ chapters }: { chapters: CaseStudyChapter[] }) {
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
              fontSize: "clamp(28px, 3.5vw, 48px)",
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
                    fontSize: "clamp(17px, 1.5vw, 21px)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--ink)",
                    opacity: 0.28,
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
                    fontSize: "clamp(17px, 1.6vw, 24px)",
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

        {/* Research — full-width image */}
        <FadeUp delay={200}>
          <div
            style={{
              borderRadius: 0,
              overflow: "hidden",
              aspectRatio: "16/7",
              position: "relative",
              border: "1px solid var(--grid-line)",
            }}
          >
            <Image
              src="/images/cs-arma4-1.jpg"
              alt="Research process"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
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
              fontSize: "clamp(28px, 3.5vw, 48px)",
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
                    padding: "0 clamp(12px, 2vw, 28px)",
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
              gap: "clamp(24px, 4vw, 56px)",
              marginBottom: 56,
            }}
          >
            <div>
              <p
                className="font-futura"
                style={{
                  fontSize: "clamp(16px, 1.35vw, 19px)",
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
                  fontSize: "clamp(16px, 1.35vw, 19px)",
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

        {/* Full-width process image */}
        <FadeUp delay={240}>
          <div
            style={{
              borderRadius: 0,
              overflow: "hidden",
              aspectRatio: "16/7",
              position: "relative",
            }}
          >
            <Image
              src="/images/cs-arma4-4.jpg"
              alt="Design process detail"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
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
          width="20"
          height="20"
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
          width="20"
          height="20"
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
          width="20"
          height="20"
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
              fontSize: "clamp(28px, 3.5vw, 48px)",
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
              aspectRatio: "16/8",
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
                  borderLeft: "3px solid rgba(36,36,36,0.75)",
                  borderRadius: 0,
                  padding: "32px 28px 28px",
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
                {/* Large step number */}
                <p
                  className="font-caslon"
                  style={{
                    fontSize: "clamp(48px, 5vw, 72px)",
                    color: "rgba(36,36,36,0.1)",
                    lineHeight: 1,
                    marginBottom: 20,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                {/* Icon */}
                <div
                  style={{
                    color: "var(--ink-muted)",
                    marginBottom: 14,
                  }}
                >
                  {card.icon}
                </div>
                <p
                  className="font-futura"
                  style={{
                    fontSize: 16,
                    color: "var(--ink)",
                    fontWeight: 600,
                    marginBottom: 10,
                    letterSpacing: "0.01em",
                  }}
                >
                  {card.title}
                </p>
                <p
                  className="font-futura"
                  style={{
                    fontSize: 14,
                    color: "var(--ink-muted)",
                    lineHeight: 1.7,
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
function ReflectionSection({ chapters }: { chapters: CaseStudyChapter[] }) {
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
        background: "#1a1e15",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GridBackground forceDark />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          ...sectionPad,
          padding: "clamp(80px, 12vw, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <FadeUp>
          <Eyebrow text="Takeaways" light />
          <h2
            className="font-caslon"
            style={{
              fontSize: "clamp(28px, 3.5vw, 52px)",
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
                fontSize: "clamp(22px, 2.8vw, 38px)",
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
              aspectRatio: "16/6",
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
function NextProjectSection() {
  return (
    <section
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--grid-line)",
      }}
    >
      <div
        style={{
          ...sectionPad,
          padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <FadeUp>
          <Eyebrow text="Navigation" />
          <p
            className="font-futura"
            style={{
              fontSize: "clamp(13px, 1vw, 15px)",
              color: "var(--ink-muted)",
              marginBottom: 16,
              letterSpacing: "0.04em",
            }}
          >
            You&apos;ve reached the end
          </p>
          <Link
            href="/portfolio"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                border: "1px solid var(--grid-line)",
                borderRadius: 0,
                padding: "14px 32px",
                transition:
                  "border-color 0.25s ease, background 0.25s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "rgba(36,36,36,0.05)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(36,36,36,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--grid-line)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M10 3L5 8l5 5"
                  stroke="var(--ink)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                Back to Portfolio
              </span>
            </div>
          </Link>
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

  // Track scroll to know when nav should flip from dark→light mode
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setScrolledPastHero(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

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
        <ResearchSection chapters={chapters} />

        {/* 5 — Process */}
        <ProcessSection chapters={chapters} />

        {/* 6 — Solution */}
        <SolutionSection study={study} />

        {/* 7 — Reflection (dark) */}
        <ReflectionSection chapters={chapters} />

        {/* 8 — Next project */}
        <NextProjectSection />
      </main>
    </>
  );
}
