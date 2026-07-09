"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import { portfolioItems, PortfolioItem } from "@/lib/data";

function GlassCard({ project, index }: { project: PortfolioItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger only for cards visible on initial load (within ~1s of mount)
          const elapsed = Date.now() - mountedAt.current;
          const delay = elapsed < 1000 ? index * 130 : 0;
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <Link
      ref={ref}
      href={`/case-study/${project.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => sessionStorage.setItem("caseStudySource", "portfolio")}
      className="portfolio-glass-card"
      style={{
        position: "relative",
        width: 320,
        height: 320,
        borderRadius: 8,
        textDecoration: "none",
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        boxShadow: "2px 4px 20px 0px rgba(0,0,0,0.08)",
        display: "block",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* ── Cover image — anchored to bottom, height shrinks to 0 on hover (disappears top-down) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: hovered ? 0 : 180,
          zIndex: 1,
          overflow: "hidden",
          transition: "height 480ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 180,
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: project.iconBg, opacity: 0.15 }} />
        )}
      </div>

      {/* ── Content layer — always on top, description/date/CTA fade in on hover ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: "28px 28px 28px",
        }}
      >
        {/* Icon + tags row — icon grows in place, tags anchored at fixed left offset */}
        <div style={{ position: "relative", height: 44, flexShrink: 0 }}>
          {/* Icon — absolutely positioned, grows without shifting tags */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: hovered ? 44 : 36,
              height: hovered ? 44 : 36,
              overflow: "hidden",
              transition: "width 380ms cubic-bezier(0.22, 1, 0.36, 1), height 380ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {project.iconSrc ? (
              <img
                src={project.iconSrc}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            ) : (
              <span className="font-caslon" style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1 }}>
                {project.title.charAt(0)}
              </span>
            )}
          </div>

          {/* Tags — anchored at fixed position, never shift */}
          <div
            style={{
              position: "absolute",
              left: 48,
              right: 0,
              top: 0,
              display: "flex",
              justifyContent: "flex-end",
              gap: 6,
              overflow: "hidden",
            }}
          >
            {project.tags.map((tag) => (
              <span key={tag} className="portfolio-tag" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Title — shifts down slightly on hover */}
        <p
          className="font-caslon portfolio-card-title"
          style={{
            marginTop: hovered ? 20 : 10,
            flexShrink: 0,
            transition: "margin-top 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {project.title}
        </p>

        {/* Description — fades + slides in below title */}
        <p
          className="font-futura"
          style={{
            fontSize: "0.85rem",
            fontWeight: 400,
            color: "var(--ink)",
            lineHeight: 1.65,
            marginTop: 12,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(-8px)",
            transition: hovered
              ? "opacity 320ms ease 120ms, transform 380ms cubic-bezier(0.22, 1, 0.36, 1) 100ms"
              : "opacity 180ms ease, transform 180ms ease",
          }}
        >
          {project.description}
        </p>

        {/* Date — right below description */}
        <p
          className="font-futura"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-faint)",
            textAlign: "right",
            marginTop: 10,
            opacity: hovered ? 1 : 0,
            transition: hovered ? "opacity 320ms ease 140ms" : "opacity 180ms ease",
          }}
        >
          {project.date}
        </p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA — pinned to bottom right */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            opacity: hovered ? 1 : 0,
            transition: hovered ? "opacity 320ms ease 180ms" : "opacity 180ms ease",
          }}
        >
          <span
            className="nav-link"
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            View case study →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PortfolioPage() {

  return (
    <>
      <Navigation />

      {/* Breathing grid background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", filter: "blur(0.6px)" }}>
        <GridBackground />
      </div>

      {/* Page content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 130,
          paddingBottom: 80,
        }}
      >
        {/* Page label */}
        <p
          className="font-futura"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-faint)",
            marginBottom: "2.5rem",
          }}
        >
          Selected Work
        </p>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 320px)",
            gap: 32,
            justifyContent: "center",
            maxWidth: 1200,
            width: "100%",
            padding: "0 var(--page-pad)",
          }}
        >
          {portfolioItems.map((project, i) => (
            <GlassCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
