"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import { CaseStudy, CaseStudyChapter, ChapterBlock } from "@/lib/types";
import { PortfolioItem } from "@/lib/data";

/* ─── Scroll engine constants ─────────────────────────────────── */
const TRANSITION_MS = 820;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ─── Chapter icon SVGs ───────────────────────────────────────── */
function ChapterIcon({ num, dark }: { num: number; dark: boolean }) {
  const stroke = dark ? "var(--bg)" : "var(--ink)";
  const s = { stroke, fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (num === 1) return (
    <svg width="22" height="22" viewBox="0 0 24 24"><path {...s} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path {...s} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  );
  if (num === 2) return (
    <svg width="22" height="22" viewBox="0 0 24 24"><path {...s} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line {...s} x1="12" y1="9" x2="12" y2="13"/><line {...s} x1="12" y1="17" x2="12.01" y2="17"/></svg>
  );
  if (num === 3) return (
    <svg width="22" height="22" viewBox="0 0 24 24"><circle {...s} cx="11" cy="11" r="8"/><line {...s} x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  );
  if (num >= 4) return (
    <svg width="22" height="22" viewBox="0 0 24 24"><path {...s} d="M12 19l7-7 3 3-7 7-3-3z"/><path {...s} d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path {...s} d="M2 2l7.586 7.586"/><circle {...s} cx="11" cy="11" r="2"/></svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"><line {...s} x1="18" y1="20" x2="18" y2="10"/><line {...s} x1="12" y1="20" x2="12" y2="4"/><line {...s} x1="6" y1="20" x2="6" y2="14"/></svg>
  );
}

/* ─── Process flow bar ─────────────────────────────────────────── */
function ProcessFlow({ steps, dark }: { steps: string[]; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.35)" : "rgba(36,36,36,0.35)";
  const stepIcons = [
    // Define
    <svg key="d" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
    // Research
    <svg key="r" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    // Analyze
    <svg key="a" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    // Design
    <svg key="de" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>,
    // Test
    <svg key="t" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.7"/></svg>,
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32, flexWrap: "wrap" }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ color: ink, opacity: 0.7 }}>{stepIcons[i]}</div>
            <span className="font-futura" style={{ fontSize: 13, color: muted, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ display: "flex", alignItems: "center", paddingBottom: 20, padding: "0 12px 20px" }}>
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5h13M9 1l5 4-5 4" stroke={muted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Challenge icons ──────────────────────────────────────────── */
function ChallengeIcons({ challenges, dark }: { challenges: { label: string; icon: string }[]; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  const s = { stroke: ink, fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  const icons: Record<string, React.ReactNode> = {
    wrench: <svg width="28" height="28" viewBox="0 0 24 24"><path {...s} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    clock:  <svg width="28" height="28" viewBox="0 0 24 24"><circle {...s} cx="12" cy="12" r="10"/><polyline {...s} points="12 6 12 12 16 14"/></svg>,
    book:   <svg width="28" height="28" viewBox="0 0 24 24"><path {...s} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path {...s} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    briefcase: <svg width="28" height="28" viewBox="0 0 24 24"><rect {...s} x="2" y="7" width="20" height="14" rx="2" ry="2"/><path {...s} d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  };

  return (
    <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
      {challenges.map((ch) => (
        <div key={ch.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ opacity: 0.65 }}>{icons[ch.icon]}</div>
          <span className="font-futura" style={{ fontSize: 14, color: muted, letterSpacing: "0.03em", textAlign: "center" }}>{ch.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Block renderers ──────────────────────────────────────────── */
function MetaBlock({ block, dark }: { block: Extract<ChapterBlock, { type: "meta" }>; dark: boolean }) {
  const border = dark ? "rgba(225,223,216,0.12)" : "rgba(36,36,36,0.1)";
  const muted = dark ? "rgba(225,223,216,0.45)" : "rgba(36,36,36,0.45)";
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const glass = dark
    ? "linear-gradient(-59.58deg,rgba(170,170,170,0.06) 0%,rgba(170,170,170,0.12) 100%)"
    : "linear-gradient(-59.58deg,rgba(195,195,195,0.15) 0%,rgba(255,255,255,0.06) 100%)";
  return (
    <div style={{ background: glass, border: `1px solid ${border}`, borderRadius: 16, padding: "24px 32px", display: "flex", gap: 0, marginBottom: 32 }}>
      {[
        { label: "Timeline", value: block.timeline },
        { label: "Position", value: block.position },
        { label: "Tools", value: block.tools.join(" · ") },
      ].map((item, i) => (
        <div key={item.label} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? `1px solid ${border}` : "none", paddingLeft: i > 0 ? 24 : 0 }}>
          <p className="font-futura" style={{ fontSize: 13, color: muted, fontStyle: "italic", marginBottom: 6, letterSpacing: "0.04em" }}>{item.label}</p>
          <p className="font-futura" style={{ fontSize: 16, color: ink, fontWeight: 500 }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function OverviewBlock({ block, dark }: { block: Extract<ChapterBlock, { type: "overview" }>; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  const divider = dark ? "rgba(225,223,216,0.1)" : "rgba(36,36,36,0.08)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 40 }}>
      <div>
        <p className="font-futura" style={{ fontSize: 17, color: ink, lineHeight: 1.75, fontWeight: 300, whiteSpace: "pre-line" }}>{block.leftText}</p>
      </div>
      <div style={{ background: divider }} />
      <div>
        <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>{block.rightHeading}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {block.rightItems.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ color: muted, marginTop: 4, flexShrink: 0 }}>→</span>
              <span className="font-futura" style={{ fontSize: 15, color: ink, lineHeight: 1.6, fontWeight: 300 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DarkQuoteBlock({ block }: { block: Extract<ChapterBlock, { type: "dark-quote" }> }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#1c1c1c 0%,#2a2a2a 100%)", borderRadius: 20, padding: "36px 48px", marginBottom: 36, border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="font-futura" style={{ fontSize: "clamp(17px,1.4vw,22px)", fontStyle: "italic", color: "rgba(225,223,216,0.9)", lineHeight: 1.65, fontWeight: 300, letterSpacing: "0.01em" }}>{block.text}</p>
    </div>
  );
}

function TwoColBulletsBlock({ block, dark }: { block: Extract<ChapterBlock, { type: "two-col-bullets" }>; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  const divider = dark ? "rgba(225,223,216,0.08)" : "rgba(36,36,36,0.07)";
  const renderCol = (heading: string, items: string[]) => (
    <div>
      <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>{heading}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: muted, fontSize: 10, marginTop: 5, flexShrink: 0 }}>◆</span>
            <span className="font-futura" style={{ fontSize: 15, color: ink, lineHeight: 1.6, fontWeight: 300 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 40, marginBottom: 8 }}>
      {renderCol(block.leftHeading, block.leftItems)}
      <div style={{ background: divider }} />
      {renderCol(block.rightHeading, block.rightItems)}
    </div>
  );
}

function ImageRowBlock({ block, onImageClick }: { block: Extract<ChapterBlock, { type: "image-row" }>; onImageClick: (i: number) => void }) {
  const imgs = block.images;
  if (imgs.length === 1) return (
    <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 32, cursor: "zoom-in" }} onClick={() => onImageClick(0)}>
      <img src={imgs[0]} alt="" style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }} />
    </div>
  );
  if (imgs.length === 2) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
      {imgs.map((src, i) => (
        <div key={i} style={{ borderRadius: 12, overflow: "hidden", cursor: "zoom-in" }} onClick={() => onImageClick(i)}>
          <img src={src} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 10, marginBottom: 32 }}>
      {imgs.map((src, i) => (
        <div key={i} style={{ borderRadius: 10, overflow: "hidden", cursor: "zoom-in" }} onClick={() => onImageClick(i)}>
          <img src={src} alt="" style={{ width: "100%", height: i === 1 ? 240 : 200, objectFit: "cover", display: "block" }} />
        </div>
      ))}
    </div>
  );
}

function FindingsBlock({ block, dark }: { block: Extract<ChapterBlock, { type: "two-col-findings" }>; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  const glass = dark ? "rgba(255,255,255,0.04)" : "rgba(36,36,36,0.04)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(36,36,36,0.08)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 40 }}>
      <div>
        <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>{block.leftHeading}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {block.leftItems.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: muted, fontSize: 10, marginTop: 5, flexShrink: 0 }}>◆</span>
              <span className="font-futura" style={{ fontSize: 15, color: ink, lineHeight: 1.6, fontWeight: 300 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: dark ? "rgba(225,223,216,0.08)" : "rgba(36,36,36,0.07)" }} />
      <div>
        <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>{block.rightHeading}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {block.findings.map((f) => (
            <div key={f.num} style={{ background: glass, border: `1px solid ${border}`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span className="font-futura" style={{ fontSize: 13, color: muted, fontWeight: 600, flexShrink: 0, paddingTop: 2 }}>{f.num}</span>
              <span className="font-futura" style={{ fontSize: 14, color: ink, lineHeight: 1.55, fontWeight: 300 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwoColTextBlock({ block, dark }: { block: Extract<ChapterBlock, { type: "two-col-text" }>; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  const divider = dark ? "rgba(225,223,216,0.08)" : "rgba(36,36,36,0.07)";
  // Parse inline sub-headings (lines that are ALL CAPS and short get styled as headings)
  const renderText = (text: string) => {
    return text.split("\n\n").map((para, i) => {
      const trimmed = para.trim();
      // detect "Concept" or "IDEATION" style inline headings
      if (trimmed.length < 20 && trimmed === trimmed[0].toUpperCase() + trimmed.slice(1) && !trimmed.includes(" ")) {
        return <p key={i} className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "20px 0 10px", fontWeight: 600 }}>{trimmed}</p>;
      }
      return <p key={i} className="font-futura" style={{ fontSize: 15, color: ink, lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>{trimmed}</p>;
    });
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 40 }}>
      <div>
        {block.leftHeading && <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>{block.leftHeading}</p>}
        {renderText(block.leftText)}
      </div>
      <div style={{ background: divider }} />
      <div>
        {block.rightHeading && <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>{block.rightHeading}</p>}
        {renderText(block.rightText)}
      </div>
    </div>
  );
}

function ReflectionBlock({ block, dark }: { block: Extract<ChapterBlock, { type: "reflection" }>; dark: boolean }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  return (
    <div style={{ marginBottom: 36 }}>
      <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Reflection</p>
      <p className="font-futura" style={{ fontSize: 16, color: ink, lineHeight: 1.8, fontWeight: 300, maxWidth: 720 }}>{block.text}</p>
    </div>
  );
}

function DeliverablesTakeawaysBlock({ block, dark, onImageClick }: { block: Extract<ChapterBlock, { type: "metrics-takeaways" }>; dark: boolean; onImageClick: (i: number) => void }) {
  const ink = dark ? "var(--bg)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.5)" : "rgba(36,36,36,0.5)";
  const glass = dark ? "rgba(255,255,255,0.05)" : "rgba(36,36,36,0.04)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(36,36,36,0.08)";
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }}>
        {/* Left: numbered deliverable cards */}
        <div>
          <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>{block.metricsHeading}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {block.metrics.map((m) => (
              <div key={m.num} style={{ background: glass, border: `1px solid ${border}`, borderRadius: 12, padding: "16px 18px" }}>
                <p className="font-futura" style={{ fontSize: 12, color: muted, marginBottom: 8 }}>{m.num}</p>
                <p className="font-futura" style={{ fontSize: 14, color: ink, lineHeight: 1.5, fontWeight: 300 }}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right: image */}
        {block.image && (
          <div style={{ borderRadius: 16, overflow: "hidden", cursor: "zoom-in" }} onClick={() => onImageClick(0)}>
            <img src={block.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 200 }} />
          </div>
        )}
      </div>
      {/* Takeaways */}
      <div style={{ borderTop: `1px solid ${border}`, paddingTop: 32 }}>
        <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>{block.takeawaysHeading}</p>
        <p className="font-futura" style={{ fontSize: 16, color: ink, lineHeight: 1.8, fontWeight: 300 }}>{block.takeaways}</p>
      </div>
    </div>
  );
}

/* ─── Chapter content dispatcher ──────────────────────────────── */
function ChapterContent({ chapter, onImageClick }: { chapter: CaseStudyChapter; onImageClick: (imgIdx: number) => void }) {
  const dark = chapter.darkBg ?? false;
  let imgCounter = 0;
  return (
    <>
      {chapter.blocks.map((block, i) => {
        if (block.type === "meta") return <MetaBlock key={i} block={block} dark={dark} />;
        if (block.type === "overview") return <OverviewBlock key={i} block={block} dark={dark} />;
        if (block.type === "dark-quote") return <DarkQuoteBlock key={i} block={block} />;
        if (block.type === "two-col-bullets") return <TwoColBulletsBlock key={i} block={block} dark={dark} />;
        if (block.type === "challenge-icons") return <ChallengeIcons key={i} challenges={block.challenges} dark={dark} />;
        if (block.type === "image-row") {
          const startIdx = imgCounter;
          imgCounter += block.images.length;
          return <ImageRowBlock key={i} block={block} onImageClick={(localIdx) => onImageClick(startIdx + localIdx)} />;
        }
        if (block.type === "two-col-findings") return <FindingsBlock key={i} block={block} dark={dark} />;
        if (block.type === "process-steps") return <ProcessFlow key={i} steps={block.steps} dark={dark} />;
        if (block.type === "two-col-text") return <TwoColTextBlock key={i} block={block} dark={dark} />;
        if (block.type === "reflection") return <ReflectionBlock key={i} block={block} dark={dark} />;
        if (block.type === "metrics-takeaways") {
          const startIdx = imgCounter;
          imgCounter += block.image ? 1 : 0;
          return <DeliverablesTakeawaysBlock key={i} block={block} dark={dark} onImageClick={(localIdx) => onImageClick(startIdx + localIdx)} />;
        }
        return null;
      })}
    </>
  );
}

/* ─── Hero panel ───────────────────────────────────────────────── */
function HeroPanelV2({ title, subtitle, coverImage, iconBg, iconSrc, onScrollDown }: {
  title: string; subtitle: string; coverImage: string; iconBg: string; iconSrc?: string; onScrollDown: () => void;
}) {
  return (
    <div style={{ minHeight: "100dvh", background: "#0E1309", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* Breathing grid */}
      <GridBackground forceDark />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 40px", maxWidth: 760, width: "100%", marginTop: -60 }}>
        {/* Icon */}
        <div style={{ marginBottom: 28, flexShrink: 0 }}>
          {iconSrc ? <img src={iconSrc} alt="" style={{ width: 48, height: 48, objectFit: "contain", display: "block" }} /> : <span className="font-caslon" style={{ fontSize: 28, color: "rgba(225,223,216,0.9)" }}>{title[0]}</span>}
        </div>
        {/* Title */}
        <h1 className="font-caslon" style={{ fontSize: "clamp(36px,4.2vw,62px)", color: "rgba(225,223,216,0.95)", lineHeight: 1.05, marginBottom: 16, letterSpacing: "0.01em" }}>{title}</h1>
        {/* Subtitle */}
        <p className="font-futura" style={{ fontSize: "clamp(14px,1.3vw,18px)", color: "rgba(225,223,216,0.45)", fontWeight: 300, marginBottom: 36 }}>{subtitle}</p>
        {/* Cover card */}
        <div style={{ width: "100%", maxWidth: 650, borderRadius: 20, overflow: "hidden", background: "#1a2015", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <img src={coverImage} alt="" style={{ width: "100%", height: 320, objectFit: "cover", display: "block", opacity: 0.9 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }} />
        </div>
      </div>
      {/* Scroll indicator */}
      <div onClick={onScrollDown} style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,transparent,rgba(225,223,216,0.35))" }} />
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M1 1l7 6 7-6" stroke="rgba(225,223,216,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

/* ─── Chapter panel ─────────────────────────────────────────────── */
function ChapterPanelV2({ chapter, chapterNum, totalChapters, onImageClick }: {
  chapter: CaseStudyChapter; chapterNum: number; totalChapters: number; onImageClick: (imgIdx: number) => void;
}) {
  const dark = chapter.darkBg ?? false;
  const bg = dark ? "#0E1309" : "var(--bg)";
  const ink = dark ? "rgba(225,223,216,0.9)" : "var(--ink)";
  const muted = dark ? "rgba(225,223,216,0.35)" : "rgba(36,36,36,0.35)";
  const gridLine = dark ? "rgba(255,255,255,0.03)" : "var(--grid-line)";

  const chapterLabel = chapter.num === 4.5 ? "CHAPTER FOUR AND HALF" : `CHAPTER ${["ONE","TWO","THREE","FOUR","FIVE"][Math.floor(chapter.num) - 1] || chapter.num}`;

  return (
    <div style={{ minHeight: "100dvh", background: bg, position: "relative" }}>
      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${gridLine} 1px,transparent 1px),linear-gradient(90deg,${gridLine} 1px,transparent 1px)`, backgroundSize: "56px 56px" }} />
      {/* Scroll entry line */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1, height: 64, background: `linear-gradient(to bottom,${muted},transparent)` }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "80px 48px 80px" }}>
        {/* Chapter header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 48 }}>
          <div style={{ marginBottom: 12, opacity: 0.55 }}>
            <ChapterIcon num={Math.floor(chapter.num)} dark={dark} />
          </div>
          <p className="font-futura" style={{ fontSize: 11, color: muted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>{chapterLabel}</p>
          <h2 className="font-caslon" style={{ fontSize: "clamp(28px,3vw,44px)", color: ink, lineHeight: 1.1, letterSpacing: "0.01em" }}>{chapter.title}</h2>
        </div>

        {/* Blocks */}
        <ChapterContent chapter={chapter} onImageClick={onImageClick} />
      </div>
    </div>
  );
}

/* ─── Lightbox ──────────────────────────────────────────────────── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", cursor: "zoom-out" }}>
      <img src={src} alt="" style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export default function CaseStudyV2({ study, chapters, portfolio }: {
  study: CaseStudy; chapters: CaseStudyChapter[]; portfolio?: PortfolioItem;
}) {
  const [activePanel, setActivePanel] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetPanelRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const scrollAccRef = useRef(0);
  const accumTimerRef = useRef<number | null>(null);

  const totalPanels = 1 + chapters.length; // hero + chapters

  // Collect all images from all chapters for lightbox
  const allImages: string[] = chapters.flatMap((ch) =>
    ch.blocks.flatMap((b) => {
      if (b.type === "image-row") return b.images;
      if (b.type === "metrics-takeaways" && b.image) return [b.image];
      return [];
    })
  );

  const goToPanel = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(totalPanels - 1, idx));
    if (clamped === targetPanelRef.current) return;
    targetPanelRef.current = clamped;
    isTransitioningRef.current = true;
    setActivePanel(clamped);
    setTimeout(() => { isTransitioningRef.current = false; }, TRANSITION_MS + 50);
  }, [totalPanels]);

  // Wheel handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = panelRefs.current[targetPanelRef.current];
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
      const atTop = el.scrollTop < 8;
      const down = e.deltaY > 0;
      const up = e.deltaY < 0;
      if ((down && atBottom) || (up && atTop)) {
        e.preventDefault();
        scrollAccRef.current += e.deltaY;
        if (accumTimerRef.current) window.clearTimeout(accumTimerRef.current);
        accumTimerRef.current = window.setTimeout(() => { scrollAccRef.current = 0; }, 200);
        const shouldJump = Math.abs(e.deltaY) > 150 || Math.abs(scrollAccRef.current) >= 60;
        if (shouldJump) {
          scrollAccRef.current = 0;
          if (!isTransitioningRef.current) goToPanel(targetPanelRef.current + (down ? 1 : -1));
        }
      } else {
        scrollAccRef.current = 0;
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goToPanel]);

  // Touch handler
  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50) {
        if (!isTransitioningRef.current) goToPanel(targetPanelRef.current + (dy > 0 ? 1 : -1));
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onTouchStart); window.removeEventListener("touchend", onTouchEnd); };
  }, [goToPanel]);

  const handleImageClick = useCallback((imgIdx: number) => {
    if (allImages[imgIdx]) setLightboxSrc(allImages[imgIdx]);
  }, [allImages]);

  const chapterImageOffsets = chapters.map((ch, ci) => {
    let offset = 0;
    for (let i = 0; i < ci; i++) {
      chapters[i].blocks.forEach((b) => {
        if (b.type === "image-row") offset += b.images.length;
        if (b.type === "metrics-takeaways" && b.image) offset += 1;
      });
    }
    return offset;
  });

  return (
    <>
      <Navigation />
      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        {/* Hero panel */}
        <div
          ref={(el) => { panelRefs.current[0] = el; }}
          className="cs-panel"
          style={{ position: "absolute", inset: 0, height: "100dvh", overflowY: "auto", transform: `translateY(${(0 - activePanel) * 100}dvh)`, transition: `transform ${TRANSITION_MS}ms ${EASE}`, willChange: "transform", pointerEvents: activePanel === 0 ? "auto" : "none" }}
        >
          <HeroPanelV2
            title={study.title}
            subtitle={study.subtitle}
            coverImage={study.coverImage}
            iconBg={portfolio?.iconBg ?? study.accentColor}
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
            style={{ position: "absolute", inset: 0, height: "100dvh", overflowY: "auto", transform: `translateY(${(i + 1 - activePanel) * 100}dvh)`, transition: `transform ${TRANSITION_MS}ms ${EASE}`, willChange: "transform", pointerEvents: activePanel === i + 1 ? "auto" : "none" }}
          >
            <ChapterPanelV2
              chapter={chapter}
              chapterNum={i + 1}
              totalChapters={chapters.length}
              onImageClick={(imgIdx) => handleImageClick(chapterImageOffsets[i] + imgIdx)}
            />
          </div>
        ))}

        {/* Panel dots nav */}
        <div style={{ position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10, zIndex: 100 }}>
          {Array.from({ length: totalPanels }).map((_, i) => {
            const dark = i === 0 ? true : (chapters[i - 1]?.darkBg ?? false);
            return (
              <button
                key={i}
                onClick={() => goToPanel(i)}
                style={{ width: 6, height: 6, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, background: i === activePanel ? (dark ? "rgba(225,223,216,0.9)" : "var(--ink)") : (dark ? "rgba(225,223,216,0.25)" : "rgba(36,36,36,0.2)"), transition: "background 0.25s ease, transform 0.2s ease", transform: i === activePanel ? "scale(1.5)" : "scale(1)" }}
                aria-label={`Go to section ${i}`}
              />
            );
          })}
        </div>

        {/* Back link */}
        <Link href="/portfolio" style={{ position: "fixed", left: 24, top: 80, display: "flex", alignItems: "center", gap: 8, textDecoration: "none", zIndex: 100 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke={chapters[activePanel - 1]?.darkBg || activePanel === 0 ? "rgba(225,223,216,0.5)" : "var(--ink-muted)"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-futura" style={{ fontSize: 13, letterSpacing: "0.05em", color: chapters[activePanel - 1]?.darkBg || activePanel === 0 ? "rgba(225,223,216,0.5)" : "var(--ink-muted)" }}>BACK</span>
        </Link>
      </div>

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  );
}
