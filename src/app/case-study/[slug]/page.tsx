"use client";

import React, { useState, useRef, useCallback, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import ChapterGallery, { GalleryChapter } from "@/components/ChapterGallery";
import { caseStudies, portfolioItems } from "@/lib/data";
import { CaseStudyChapter, ChapterBlock } from "@/lib/types";
import CaseStudyV2 from "./CaseStudyV2";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const TRANSITION_MS = 820;
const SCROLL_THRESHOLD = 60;

/* ─────────────────────────────────────────────
   Chapter icons
───────────────────────────────────────────── */
const CHAPTER_ICONS: Record<number, React.ReactNode> = {
  1: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  2: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  3: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  4: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  5: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
};

const CHAPTER_WORDS = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];

/* ─────────────────────────────────────────────
   Glass card helper
───────────────────────────────────────────── */
const glassStyle: React.CSSProperties = {
  background: "linear-gradient(-59.58deg, rgba(195,195,195,0.18) 7.637%, rgba(255,255,255,0.06) 92.363%)",
  backdropFilter: "blur(2.5px)",
  WebkitBackdropFilter: "blur(2.5px)",
  borderRadius: 8,
};
const glassDarkStyle: React.CSSProperties = {
  background: "linear-gradient(-59.58deg, rgba(170,170,170,0.06) 7.637%, rgba(170,170,170,0.14) 92.363%)",
};

/* ─────────────────────────────────────────────
   Block renderers
───────────────────────────────────────────── */
function MetaBlock({ block }: { block: ChapterBlock & { type: "meta" } }) {
  return (
    <div
      className="cs-glass-card cs-meta-bar"
      style={{ display: "flex", marginBottom: 48, borderRadius: 8, overflow: "hidden" }}
    >
      {[
        { label: "Timeline", value: block.timeline },
        { label: "Position", value: block.position },
        { label: "Tools", value: block.tools.join("  ·  ") },
      ].map((item, i, arr) => (
        <React.Fragment key={item.label}>
          <div style={{ flex: 1, padding: "28px 32px" }}>
            <p
              className="font-futura"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginBottom: 10,
              }}
            >
              {item.label}
            </p>
            <p className="font-futura" style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.5 }}>
              {item.value}
            </p>
          </div>
          {i < arr.length - 1 && (
            <div className="cs-meta-divider" style={{ width: 1, background: "var(--grid-line)", margin: "12px 0" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function OverviewBlock({ block }: { block: ChapterBlock & { type: "overview" } }) {
  return (
    <div
      className="cs-grid-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(48px, 8.9vw, 128px)",
      }}
    >
      <p
        className="font-futura"
        style={{
          fontSize: 15,
          lineHeight: 1.85,
          color: "var(--ink)",
          letterSpacing: "0.02em",
          textAlign: "justify",
        }}
      >
        {block.leftText}
      </p>
      <div>
        <ColHeading>{block.rightHeading}</ColHeading>
        <BulletList items={block.rightItems} />
      </div>
    </div>
  );
}

function DarkQuoteBlock({ block }: { block: ChapterBlock & { type: "dark-quote" } }) {
  return (
    <div
      style={{
        background: "linear-gradient(-24deg, #242424 7.637%, rgba(36,36,36,0.82) 92.363%)",
        borderRadius: 8,
        padding: "clamp(32px, 3.3vw, 48px) clamp(32px, 4.4vw, 64px)",
        marginBottom: 40,
      }}
    >
      <p
        className="font-futura"
        style={{
          fontSize: "clamp(16px, 1.67vw, 22px)",
          lineHeight: 1.7,
          color: "#e1dfd8",
          fontWeight: 300,
        }}
      >
        {block.text}
      </p>
    </div>
  );
}

function TwoColBulletsBlock({ block }: { block: ChapterBlock & { type: "two-col-bullets" } }) {
  return (
    <div
      className="cs-grid-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(48px, 8.9vw, 128px)",
      }}
    >
      <div>
        <ColHeading>{block.leftHeading}</ColHeading>
        <BulletList items={block.leftItems} />
      </div>
      <div>
        <ColHeading>{block.rightHeading}</ColHeading>
        <BulletList items={block.rightItems} />
      </div>
    </div>
  );
}

function ImageRowBlock({
  block,
  onImageClick,
}: {
  block: ChapterBlock & { type: "image-row" };
  onImageClick: (localIdx: number) => void;
}) {
  const imgs = block.images;
  if (imgs.length === 1) {
    return (
      <ImageThumb
        src={imgs[0]}
        onClick={() => onImageClick(0)}
        style={{ width: "100%", aspectRatio: "16/9", marginBottom: 40 }}
        radius={12}
      />
    );
  }
  if (imgs.length === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
        {imgs.map((src, j) => (
          <ImageThumb key={j} src={src} onClick={() => onImageClick(j)} style={{ aspectRatio: "16/9" }} radius={8} />
        ))}
      </div>
    );
  }
  // Masonry triptych: side | centre (taller) | side
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        marginBottom: 40,
      }}
    >
      <ImageThumb src={imgs[0]} onClick={() => onImageClick(0)} style={{ flex: "1 1 0", aspectRatio: "290/179" }} radius={8} />
      <ImageThumb src={imgs[1]} onClick={() => onImageClick(1)} style={{ flex: "1.45 1 0", aspectRatio: "420/259" }} radius={12} />
      <ImageThumb src={imgs[2]} onClick={() => onImageClick(2)} style={{ flex: "1 1 0", aspectRatio: "290/179" }} radius={8} />
    </div>
  );
}

function TwoColFindingsBlock({
  block,
}: {
  block: ChapterBlock & { type: "two-col-findings" };
}) {
  return (
    <div
      className="cs-grid-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(48px, 8.9vw, 128px)",
      }}
    >
      <div>
        <ColHeading>{block.leftHeading}</ColHeading>
        <BulletList items={block.leftItems} />
      </div>
      <div>
        <ColHeading>{block.rightHeading}</ColHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {block.findings.map(({ num, text }) => (
            <div
              key={num}
              className="cs-glass-card"
              style={{
                padding: "18px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                borderRadius: 8,
              }}
            >
              <span
                className="font-caslon"
                style={{ fontSize: 26, color: "var(--ink-muted)", lineHeight: 1.2, flexShrink: 0 }}
              >
                {num}
              </span>
              <p
                className="font-futura"
                style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65 }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessStepsBlock({ block }: { block: ChapterBlock & { type: "process-steps" } }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 40,
      }}
    >
      {block.steps.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className="cs-glass-card"
            style={{ padding: "12px 20px", borderRadius: 8, flexShrink: 0 }}
          >
            <span className="font-futura" style={{ fontSize: 13, color: "var(--ink)", letterSpacing: "0.03em" }}>
              {step}
            </span>
          </div>
          {i < block.steps.length - 1 && (
            <span style={{ color: "var(--ink-muted)", fontSize: 14, flexShrink: 0 }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function TwoColTextBlock({ block }: { block: ChapterBlock & { type: "two-col-text" } }) {
  return (
    <div
      className="cs-grid-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(48px, 8.9vw, 128px)",
        marginBottom: 40,
      }}
    >
      <div>
        <ColHeading>{block.leftHeading}</ColHeading>
        <p
          className="font-futura"
          style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink)", letterSpacing: "0.02em" }}
        >
          {block.leftText}
        </p>
      </div>
      <div>
        <ColHeading>{block.rightHeading}</ColHeading>
        <p
          className="font-futura"
          style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink)", letterSpacing: "0.02em" }}
        >
          {block.rightText}
        </p>
      </div>
    </div>
  );
}

function MetricsTakeawaysBlock({
  block,
  onImageClick,
}: {
  block: ChapterBlock & { type: "metrics-takeaways" };
  onImageClick: (idx: number) => void;
}) {
  return (
    <div
      className="cs-grid-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(48px, 8.9vw, 128px)",
      }}
    >
      {/* Left: numbered metric cards */}
      <div>
        <ColHeading>{block.metricsHeading}</ColHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {block.metrics.map(({ num, text }) => (
            <div
              key={num}
              className="cs-glass-card"
              style={{
                padding: "18px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                borderRadius: 8,
                minHeight: 72,
              }}
            >
              <span
                className="font-caslon"
                style={{ fontSize: 26, color: "var(--ink-muted)", lineHeight: 1.2, flexShrink: 0 }}
              >
                {num}
              </span>
              <p className="font-futura" style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65 }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: image + takeaways */}
      <div>
        {block.image && (
          <ImageThumb
            src={block.image}
            onClick={() => onImageClick(0)}
            style={{ width: "100%", height: 240, marginBottom: 32 }}
            radius={12}
          />
        )}
        <ColHeading>{block.takeawaysHeading}</ColHeading>
        <p
          className="font-futura"
          style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink)", letterSpacing: "0.02em" }}
        >
          {block.takeaways}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Small helpers
───────────────────────────────────────────── */
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-futura"
      style={{
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-muted)",
        marginBottom: 16,
        fontWeight: 600,
      }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item, i) => (
        <li
          key={i}
          className="font-futura"
          style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7, paddingLeft: 18, position: "relative" }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "0.6em",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--ink)",
              opacity: 0.4,
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ImageThumb({
  src,
  onClick,
  style,
  radius = 8,
}: {
  src: string;
  onClick: () => void;
  style?: React.CSSProperties;
  radius?: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: radius,
        overflow: "hidden",
        cursor: "zoom-in",
        background: "var(--bg-card)",
        flexShrink: 0,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.012)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 16px 48px rgba(0,0,0,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <img
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "0";
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chapter panel content
───────────────────────────────────────────── */
function ChapterContent({
  chapter,
  onImageClick,
  isLast,
  prevStudy,
  nextStudy,
  isMobile,
}: {
  chapter: CaseStudyChapter;
  onImageClick: (localImageIdx: number) => void;
  isLast?: boolean;
  prevStudy?: { slug: string; title: string } | null;
  nextStudy?: { slug: string; title: string } | null;
  isMobile?: boolean;
}) {
  // Pre-compute image offsets within this chapter
  let imageOffset = 0;

  return (
    <div
      className="cs-chapter-content"
      style={{
        minHeight: isMobile ? "auto" : "100dvh",
        background: "var(--bg)",
      }}
    >
      {/* Connector line — top 1/3 sits behind navbar (fades out), bottom 2/3 visible below it */}
      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 44 }}>
          <div style={{
            width: 1,
            height: 100,
            background: "linear-gradient(to bottom, transparent 0%, rgba(36,36,36,0.2) 100%)",
          }} />
        </div>
      )}

      {/* Chapter content — natural gap below the line */}
      <div style={{ padding: isMobile ? "32px 20px 80px" : "48px clamp(40px, 19.2vw, 276px) 100px" }}>

      {/* Chapter header — centered */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>

        {/* Icon + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--ink)", opacity: 0.5 }}>
            {CHAPTER_ICONS[chapter.num] ?? CHAPTER_ICONS[1]}
          </span>
          <span
            className="font-futura"
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
            }}
          >
            Chapter {CHAPTER_WORDS[chapter.num - 1] ?? chapter.num}
          </span>
        </div>

        {/* Chapter title */}
        <h2
          className="font-caslon"
          style={{
            fontSize: "clamp(28px, 2.8vw, 40px)",
            letterSpacing: "0.02em",
            color: "var(--ink)",
            lineHeight: 1.15,
            textAlign: "center",
          }}
        >
          {chapter.title}
        </h2>
      </div>

      {/* Blocks */}
      {chapter.blocks.map((block, bi) => {
        if (block.type === "meta")
          return <MetaBlock key={bi} block={block} />;
        if (block.type === "overview")
          return <OverviewBlock key={bi} block={block} />;
        if (block.type === "dark-quote")
          return <DarkQuoteBlock key={bi} block={block} />;
        if (block.type === "two-col-bullets")
          return <TwoColBulletsBlock key={bi} block={block} />;
        if (block.type === "image-row") {
          const offset = imageOffset;
          imageOffset += block.images.length;
          return (
            <ImageRowBlock
              key={bi}
              block={block}
              onImageClick={(localIdx) => onImageClick(offset + localIdx)}
            />
          );
        }
        if (block.type === "two-col-findings")
          return <TwoColFindingsBlock key={bi} block={block} />;
        if (block.type === "process-steps")
          return <ProcessStepsBlock key={bi} block={block} />;
        if (block.type === "two-col-text")
          return <TwoColTextBlock key={bi} block={block} />;
        if (block.type === "metrics-takeaways") {
          const offset = imageOffset;
          imageOffset += block.image ? 1 : 0;
          return (
            <MetricsTakeawaysBlock
              key={bi}
              block={block}
              onImageClick={(idx) => onImageClick(offset + idx)}
            />
          );
        }
        return null;
      })}

      {/* Study pagination — last chapter only */}
      {isLast && (
        <div
          style={{
            marginTop: 80,
            paddingTop: 40,
            borderTop: "1px solid var(--grid-line)",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 16 : 0,
          }}
        >
          {/* Prev study */}
          {prevStudy ? (
            <a
              href={`/case-study/${prevStudy.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
                color: "var(--ink)",
                opacity: 0.6,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.6"; }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 4L3 10L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-futura" style={{ fontSize: 14, letterSpacing: "0.04em" }}>
                <span style={{ wordBreak: "break-word" }}>{prevStudy.title}</span>
              </span>
            </a>
          ) : (
            <div />
          )}

          {/* Next study */}
          {nextStudy ? (
            <a
              href={`/case-study/${nextStudy.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
                color: "var(--ink)",
                opacity: 0.6,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.6"; }}
            >
              <span className="font-futura" style={{ fontSize: 14, letterSpacing: "0.04em" }}>
                <span style={{ wordBreak: "break-word" }}>{nextStudy.title}</span>
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 4L17 10L11 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ) : (
            <div />
          )}
        </div>
      )}
      </div>{/* end inner padding div */}

      {/* Hint line at the bottom — sticky so it's always visible at viewport bottom */}
      {!isLast && !isMobile && (
        <div style={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          paddingBottom: 16,
          pointerEvents: "none",
        }}>
          <div style={{
            width: 1,
            height: 72,
            background: "linear-gradient(to bottom, rgba(36,36,36,0.18) 0%, transparent 100%)",
          }} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hero panel
───────────────────────────────────────────── */
function HeroPanel({
  title,
  subtitle,
  coverImage,
  iconBg,
  iconLetter,
  iconSrc,
  onScrollDown,
}: {
  title: string;
  subtitle: string;
  coverImage: string;
  iconBg: string;
  iconLetter: string;
  iconSrc?: string;
  onScrollDown: () => void;
}) {
  return (
    <div
      style={{
        height: "100dvh",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* ── Title block — flex-shrink: 0 so it never compresses ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "clamp(100px, 14vh, 160px) 40px clamp(24px, 3.5vh, 48px)",
        }}
      >
        {/* Logo — bare, no box */}
        <div style={{ marginBottom: 28, flexShrink: 0 }}>
          {iconSrc ? (
            <img src={iconSrc} alt="" style={{ width: 52, height: 52, objectFit: "contain", display: "block" }} />
          ) : (
            <span className="font-caslon" style={{ fontSize: 28, color: "var(--ink)", lineHeight: 1 }}>
              {iconLetter}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="font-caslon"
          style={{
            fontSize: "clamp(32px, 4.4vw, 64px)",
            letterSpacing: "0.02em",
            color: "var(--ink)",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="font-futura"
          style={{
            fontSize: "clamp(13px, 1.4vw, 20px)",
            fontWeight: 300,
            color: "var(--ink-muted)",
            lineHeight: 1.55,
            maxWidth: "42ch",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* ── Cover image — fills remaining space, never overlaps title ── */}
      {coverImage && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "0 clamp(24px, 5vw, 80px)",
            paddingBottom: 140, // whitespace above scroll indicator
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 726,
              height: "100%",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 80px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src={coverImage}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0";
              }}
            />
          </div>
        </div>
      )}

      {/* ── Scroll-down connector — SCROLL above line, line flush to bottom ── */}
      <button
        onClick={onScrollDown}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          zIndex: 3,
          padding: "0 16px 0",
        }}
      >
        <span
          className="font-futura"
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
          }}
        >
          Scroll
        </span>
        <div style={{ width: 1, height: 56, background: "linear-gradient(to bottom, rgba(36,36,36,0.2) 0%, transparent 100%)" }} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
interface Props {
  params: Promise<{ slug: string }>;
}

export default function CaseStudyPage({ params }: Props) {
  const { slug } = use(params);
  const study = caseStudies.find((c) => c.slug === slug);
  if (!study) notFound();

  const portfolio = portfolioItems.find((p) => p.slug === slug);
  const chapters = study.chapters ?? [];

  // Prev / next studies for bottom pagination
  const currentIdx = caseStudies.findIndex((c) => c.slug === slug);
  const prevStudy = currentIdx > 0 ? caseStudies[currentIdx - 1] : null;
  const nextStudy = currentIdx < caseStudies.length - 1 ? caseStudies[currentIdx + 1] : null;

  // v2 case studies use the new template
  if (study.version === 2) {
    return <CaseStudyV2 study={study} chapters={chapters} portfolio={portfolio} />;
  }

  const totalPanels = chapters.length + 1; // hero + chapters

  /* ── Scroll engine state ── */
  const [activePanel, setActivePanel] = useState(0);
  const isTransitioningRef = useRef(false);
  const targetPanelRef = useRef(0);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAccRef = useRef(0);
  const accumTimerRef = useRef<number | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const goToPanelRef = useRef<(idx: number) => void>(() => {});

  /* ── Gallery state ── */
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryChapterIdx, setGalleryChapterIdx] = useState(0);
  const [galleryImageIdx, setGalleryImageIdx] = useState(0);

  /* ── Mobile detection ── */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Connector line overlay animation ── */
  type LinePhase = 'hidden' | 'stretch' | 'snap';
  const [linePhase, setLinePhase] = useState<LinePhase>('hidden');
  const lineVhRef = useRef(900);
  useEffect(() => { lineVhRef.current = window.innerHeight; }, []);

  /* ── goToPanel ── */
  const goToPanel = useCallback(
    (idx: number) => {
      const bounded = Math.max(0, Math.min(totalPanels - 1, idx));
      if (bounded === targetPanelRef.current && isTransitioningRef.current) return;

      targetPanelRef.current = bounded;
      setActivePanel(bounded);
      isTransitioningRef.current = true;

      // Reset destination panel's scroll
      const el = panelRefs.current[bounded];
      if (el) el.scrollTop = 0;

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false;
      }, TRANSITION_MS + 60);

      // Connector line animation: only between non-final panels
      if (bounded < totalPanels - 1) {
        lineVhRef.current = window.innerHeight;
        setLinePhase('stretch');
        setTimeout(() => setLinePhase('snap'), 80);
        setTimeout(() => setLinePhase('hidden'), 1200);
      }
    },
    [totalPanels]
  );

  // Keep ref in sync
  useEffect(() => {
    goToPanelRef.current = goToPanel;
  }, [goToPanel]);

  /* ── Wheel handler ── */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth <= 820) return;
      // Always take over scroll — prevents window elastic bounce / back-navigation on macOS
      e.preventDefault();

      const activeEl = panelRefs.current[targetPanelRef.current];
      if (!activeEl) return;

      const atBottom =
        activeEl.scrollHeight - activeEl.scrollTop - activeEl.clientHeight < 8;
      const atTop = activeEl.scrollTop < 8;
      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;

      const currentPanel = targetPanelRef.current;
      const isLastPanel = currentPanel === totalPanels - 1;

      // Last panel scrolling down: drive inner scroll manually, stop at bottom
      if (isLastPanel && goingDown) {
        if (!atBottom) activeEl.scrollTop += e.deltaY;
        return;
      }

      // Any panel scrolling up from non-top: drive inner scroll manually
      if (goingUp && !atTop) {
        activeEl.scrollTop += e.deltaY;
        return;
      }

      // At a panel boundary — accumulate to distinguish intent from overshoot
      if ((goingDown && atBottom) || (goingUp && atTop)) {
        scrollAccRef.current += e.deltaY;

        if (accumTimerRef.current) window.clearTimeout(accumTimerRef.current);
        accumTimerRef.current = window.setTimeout(() => {
          scrollAccRef.current = 0;
        }, 200);

        const shouldJump =
          Math.abs(e.deltaY) > 150 || Math.abs(scrollAccRef.current) >= SCROLL_THRESHOLD;

        if (shouldJump) {
          scrollAccRef.current = 0;
          if (!isTransitioningRef.current) {
            goToPanelRef.current(currentPanel + (goingDown ? 1 : -1));
          }
        }
      } else {
        activeEl.scrollTop += e.deltaY;
        scrollAccRef.current = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  /* ── Touch handler ── */
  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (window.innerWidth <= 820) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      const activeEl = panelRefs.current[targetPanelRef.current];
      if (!activeEl) return;
      const atBottom = activeEl.scrollHeight - activeEl.scrollTop - activeEl.clientHeight < 8;
      const atTop = activeEl.scrollTop < 8;
      const currentPanel = targetPanelRef.current;
      if (Math.abs(dy) < 40) return;
      if (dy > 0 && atBottom && currentPanel < totalPanels - 1) goToPanelRef.current(currentPanel + 1);
      else if (dy < 0 && atTop && currentPanel > 0) goToPanelRef.current(currentPanel - 1);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (isMobile) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile]);

  /* ── Gallery helpers ── */
  const openGallery = (chapterIdx: number, imageIdx: number) => {
    setGalleryChapterIdx(chapterIdx);
    setGalleryImageIdx(imageIdx);
    setGalleryOpen(true);
  };

  const galleryChapters: GalleryChapter[] = chapters.map((ch) => ({
    title: ch.title,
    images: ch.blocks
      .flatMap((b) => {
        if (b.type === "image-row") return b.images;
        if (b.type === "metrics-takeaways" && b.image) return [b.image];
        return [];
      }),
  }));

  /* ── Render ── */
  return (
    <>
      <Navigation />

      {/* Back-to-portfolio button — just below nav */}
      <a
        href="/portfolio"
        style={{
          position: "fixed",
          left: 24,
          top: 72,
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          gap: 6,
          textDecoration: "none",
          color: "var(--ink)",
          opacity: 0.45,
          cursor: "pointer",
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.45"; }}
        title="Back to portfolio"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-futura" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Work
        </span>
      </a>

      {/* ── Navigation dots ── */}
      <div
        style={{
          position: "fixed",
          right: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          display: isMobile ? "none" : "flex",
          flexDirection: "column",
          gap: "0.4rem",
          zIndex: 50,
        }}
      >
        {Array.from({ length: totalPanels }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToPanel(i)}
            title={i === 0 ? "Hero" : chapters[i - 1]?.title}
            style={{
              width: activePanel === i ? 7 : 5,
              height: activePanel === i ? 7 : 5,
              borderRadius: "50%",
              background: "var(--ink)",
              opacity: activePanel === i ? 0.9 : 0.2,
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* ── Fixed grid — stays put while panels slide ── */}
      <div className="page-grid-bg" style={{ position: "fixed", zIndex: 0 }} />

      {/* ── Connector line overlay — stretches from bottom then snaps to final position ── */}
      {!isMobile && (() => {
        const vh = lineVhRef.current;
        const STRETCH_H = Math.round(vh * 0.94);
        const STRETCH_TOP = vh - STRETCH_H;
        const SNAP_TOP = 44;
        const SNAP_H = 100;
        return (
          <div
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              width: 1,
              zIndex: 200,
              pointerEvents: "none",
              background: "linear-gradient(to bottom, transparent 0%, rgba(36,36,36,0.22) 100%)",
              ...(linePhase === "stretch" ? {
                top: STRETCH_TOP,
                height: STRETCH_H,
                opacity: 1,
                transition: "none",
              } : linePhase === "snap" ? {
                top: SNAP_TOP,
                height: SNAP_H,
                opacity: 1,
                transition: "top 1000ms cubic-bezier(0.16, 1, 0.3, 1), height 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
              } : {
                top: SNAP_TOP,
                height: SNAP_H,
                opacity: 0,
                transition: "opacity 180ms ease",
              }),
            }}
          />
        );
      })()}

      {/* ── Panel container ── */}
      <div style={isMobile ? { position: "relative", overflow: "visible", zIndex: 1 } : { position: "fixed", inset: 0, overflow: "hidden", zIndex: 1 }}>
        {/* Hero panel */}
        <div
          ref={(el) => { panelRefs.current[0] = el; }}
          className="cs-panel"
          style={isMobile ? {
            position: "relative",
            height: "auto",
            overflowY: "visible",
            transform: "none",
            transition: "none",
          } : {
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "100dvh",
            overflowY: "auto",
            transform: `translateY(${(0 - activePanel) * 100}dvh)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: "transform",
            pointerEvents: activePanel === 0 ? "auto" : "none",
          }}
        >
          <HeroPanel
            title={study.title}
            subtitle={study.subtitle}
            coverImage={study.coverImage}
            iconBg={portfolio?.iconBg ?? study.accentColor}
            iconLetter={study.title.charAt(0)}
            iconSrc={portfolio?.iconSrc}
            onScrollDown={() => goToPanel(1)}
          />
        </div>

        {/* Chapter panels */}
        {chapters.map((chapter, i) => (
          <div
            key={chapter.id}
            ref={(el) => { panelRefs.current[i + 1] = el; }}
            className="cs-panel"
            style={isMobile ? {
              position: "relative",
              height: "auto",
              overflowY: "visible",
              transform: "none",
              transition: "none",
            } : {
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "100dvh",
              overflowY: "auto",
              transform: `translateY(${(i + 1 - activePanel) * 100}dvh)`,
              transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              willChange: "transform",
              pointerEvents: activePanel === i + 1 ? "auto" : "none",
            }}
          >
            <ChapterContent
              chapter={chapter}
              onImageClick={(imgIdx) => openGallery(i, imgIdx)}
              isLast={i === chapters.length - 1}
              prevStudy={prevStudy}
              nextStudy={nextStudy}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>

      {/* ── Gallery ── */}
      {galleryOpen && galleryChapters.some((c) => c.images.length > 0) && (
        <ChapterGallery
          chapters={galleryChapters}
          initialChapter={galleryChapterIdx}
          initialImage={galleryImageIdx}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
