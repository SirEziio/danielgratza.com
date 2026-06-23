"use client";

import { useEffect, useRef } from "react";
import { TimelineEntry } from "@/lib/types";

interface Props {
  entries: TimelineEntry[];
}

export default function Timeline({ entries }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = containerRef.current?.querySelectorAll<HTMLDivElement>(".reveal");
    if (!items) return;

    const observer = new IntersectionObserver(
      (obs) => {
        obs.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        paddingLeft: "2rem",
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: "0.3rem",
          top: 0,
          bottom: 0,
          width: 1,
          background: "var(--border)",
          opacity: 0.25,
        }}
      />

      {entries.map((entry, i) => (
        <div
          key={i}
          className="reveal"
          style={{
            position: "relative",
            marginBottom: "2rem",
            transitionDelay: `${i * 80}ms`,
          }}
        >
          {/* Dot */}
          <div
            style={{
              position: "absolute",
              left: "-1.82rem",
              top: "0.25rem",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: entry.dotColor,
              boxShadow: `0 0 0 3px var(--bg), 0 0 0 4px ${entry.dotColor}33`,
              zIndex: 1,
            }}
          />

          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            {/* Year */}
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "var(--ink-muted)",
                minWidth: "2.5rem",
                paddingTop: "0.2rem",
              }}
            >
              {entry.year}
            </span>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "var(--ink)",
                  lineHeight: 1.3,
                }}
              >
                {entry.org}
                {entry.current && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background: "var(--lime)",
                      color: "#242424",
                      padding: "0.1em 0.5em",
                      borderRadius: "999px",
                    }}
                  >
                    Now
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--ink-muted)",
                  marginTop: "0.15rem",
                }}
              >
                {entry.role}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
