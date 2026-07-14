"use client";

import Link from "next/link";
import Image from "next/image";
import { CaseStudy } from "@/lib/types";

interface Props {
  study: CaseStudy;
  variant?: "light" | "dark";
}

export default function CaseStudyCard({ study, variant = "light" }: Props) {
  const isDark = variant === "dark";

  return (
    <Link
      href={`/case-study/${study.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        background: isDark ? "#1E1E1E" : "var(--bg-card)",
        borderRadius: "12px",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(36,36,36,0.08)",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = isDark
          ? "0 20px 60px rgba(0,0,0,0.5)"
          : "0 20px 60px rgba(36,36,36,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
      }}
    >
      {/* Thumbnail */}
      <div
        className="skeleton-bg"
        style={{
          width: "100%",
          paddingBottom: "62%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {study.thumbnail && (
          <Image
            src={study.thumbnail}
            alt={study.title}
            fill
            sizes="(max-width: 840px) 92vw, 420px"
            loading="lazy"
            style={{ objectFit: "cover" }}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
        )}
        {/* Accent dot */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: study.accentColor,
          }}
        />
        {/* Year badge */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(36,36,36,0.5)",
            fontFamily: "inherit",
          }}
        >
          {study.year}
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
        <p
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isDark ? "rgba(240,236,228,0.45)" : "rgba(36,36,36,0.45)",
            marginBottom: "0.4rem",
          }}
        >
          {study.role} · {study.timeline}
        </p>
        <h3
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: isDark ? "#F0ECE4" : "#242424",
            margin: "0 0 0.5rem",
            lineHeight: 1.25,
          }}
        >
          {study.title}
        </h3>
        <p
          style={{
            fontSize: "0.82rem",
            color: isDark ? "rgba(240,236,228,0.6)" : "rgba(36,36,36,0.6)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {study.subtitle}
        </p>

        {/* CTA row */}
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isDark ? "rgba(240,236,228,0.4)" : "rgba(36,36,36,0.4)",
            }}
          >
            View case study →
          </span>
        </div>
      </div>
    </Link>
  );
}
