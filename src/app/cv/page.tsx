"use client";

import Navigation from "@/components/Navigation";

export default function CVPage() {
  const pdfPath = "/CV 2026.pdf";

  return (
    <>
      <Navigation />

      <style>{`
        .cv-pdf {
          width: 100%;
        }
        @media (min-width: 768px) {
          .cv-pdf {
            max-width: min(80vw, 1280px);
            margin: 0 auto;
          }
        }
      `}</style>

      <div
        style={{
          paddingTop: "max(72px, calc(56px + env(safe-area-inset-top, 0px)))",
          paddingBottom: 60,
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        {/* Toolbar — always aligned with nav logo/hamburger */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBlock: 10,
            marginBottom: 20,
            paddingLeft: "var(--page-pad)",
            paddingRight: "var(--page-pad)",
          }}
        >
            <a
              href="/contact"
              className="nav-link"
              style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.04em" }}
            >
              ← Back
            </a>
            <a
              href={pdfPath}
              download="Daniel Gratza — CV 2026.pdf"
              className="nav-link"
              style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Download PDF
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1.5v7M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </a>
          </div>

        {/* PDF — A4 aspect ratio, max-width on desktop, full-width on mobile */}
        <div className="cv-pdf">
          <div style={{ position: "relative", width: "100%", paddingTop: "141.43%" }}>
            <iframe
              src={pdfPath + "#toolbar=0&navpanes=0&scrollbar=1"}
              title="Daniel Gratza — CV 2026"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
}
