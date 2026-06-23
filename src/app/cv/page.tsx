"use client";

import Navigation from "@/components/Navigation";
import { timelineEntries } from "@/lib/data";

export default function CVPage() {
  return (
    <>
      <Navigation />
      <div
        style={{
          minHeight: "100dvh",
          padding: "8rem 8% 6rem",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "3.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "2.5rem",
            opacity: 0.15,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "3.5rem",
          }}
        >
          <div>
            <p className="font-label" style={{ color: "var(--ink-muted)", marginBottom: "0.5rem" }}>
              Curriculum Vitae
            </p>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "var(--ink)", margin: 0 }}
            >
              Daniel Gratza
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", marginTop: "0.35rem" }}>
              UX / UI Designer · Brno, Czech Republic
            </p>
          </div>

          {/* Download button */}
          <a
            href="/cv.pdf"
            download
            className="nav-pill"
            style={{
              fontSize: "0.82rem",
              padding: "0.6em 1.5em 0.6em 1.6em",
              alignSelf: "flex-start",
              transition: "background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = "translateY(-2px) scale(1.04)";
              el.style.boxShadow = "0 8px 28px rgba(197,209,0,0.3)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = "translateY(0) scale(1)";
              el.style.boxShadow = "none";
            }}
          >
            Download PDF ↓
          </a>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
          }}
        >
          {/* Left column */}
          <div>
            {/* Summary */}
            <Section title="Summary">
              <p style={{ fontSize: "0.88rem", color: "var(--ink-muted)", lineHeight: 1.75, margin: 0 }}>
                UX/UI designer with a background in psychology and computer graphics. I design digital products that are both functional and expressive — combining research, systems thinking, and a sharp eye for detail.
              </p>
            </Section>

            {/* Skills */}
            <Section title="Skills">
              {[
                "Product & UX Design",
                "User Research & Testing",
                "Prototyping & Wireframing",
                "Design Systems",
                "Data Analysis",
                "Brand Identity",
                "Figma · FigJam",
                "Adobe CC",
                "Framer · Webflow",
                "SQL · Python basics",
              ].map((skill) => (
                <div
                  key={skill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "0.45rem",
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#C5D100",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{skill}</span>
                </div>
              ))}
            </Section>

            {/* Languages */}
            <Section title="Languages">
              {[
                { lang: "Czech", level: "Native" },
                { lang: "English", level: "Fluent (C1)" },
                { lang: "German", level: "Basic (A2)" },
              ].map(({ lang, level }) => (
                <div
                  key={lang}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span style={{ color: "var(--ink)" }}>{lang}</span>
                  <span style={{ color: "var(--ink-muted)" }}>{level}</span>
                </div>
              ))}
            </Section>
          </div>

          {/* Right column — Experience & Education */}
          <div>
            <Section title="Experience">
              {timelineEntries
                .filter((e) => e.type === "work")
                .reverse()
                .map((entry, i) => (
                  <div key={i} style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>
                        {entry.org}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
                        {entry.year}
                        {entry.current ? " — Now" : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "0.15rem" }}>
                      {entry.role}
                    </div>
                  </div>
                ))}
            </Section>

            <Section title="Education">
              {timelineEntries
                .filter((e) => e.type === "education")
                .map((entry, i) => (
                  <div key={i} style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>
                        {entry.org}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
                        {entry.year}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "0.15rem" }}>
                      {entry.role}
                    </div>
                  </div>
                ))}
            </Section>
          </div>
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            opacity: 0.15,
          }}
        />
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.7rem",
            color: "var(--ink-muted)",
            letterSpacing: "0.06em",
          }}
        >
          daniel@gratza.cz · linkedin.com/in/danielgratza · gratza.cz
        </p>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <p
        className="font-label"
        style={{ color: "var(--ink-muted)", marginBottom: "1rem", fontSize: "0.65rem" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
