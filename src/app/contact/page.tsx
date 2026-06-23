"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";
import PillCTA from "@/components/PillCTA";

/* ──────────────────────────────────────────────────────────────
   Social icon SVGs — outlined, monochrome, 36 × 36
────────────────────────────────────────────────────────────── */
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <rect x="3" y="3" width="30" height="30" rx="5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="15" width="3" height="12" fill="currentColor"/>
      <circle cx="10.5" cy="11.5" r="1.8" fill="currentColor"/>
      <path d="M15 15h3v1.6c.7-1.1 2-1.8 3.5-1.8 2.8 0 4.5 1.9 4.5 5.2V27h-3v-6.5c0-1.7-.8-2.7-2.2-2.7-1.5 0-2.3 1-2.3 2.8V27h-3V15z" fill="currentColor"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <rect x="3" y="3" width="30" height="30" rx="7" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="18" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="26" cy="10" r="1.2" fill="currentColor"/>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <path d="M18 3C10 3 3.5 9.4 3.5 17.4c0 2.5.7 4.9 1.9 7L3 33l8.9-2.3c2 1.1 4.3 1.7 6.6 1.7 8 0 14.5-6.4 14.5-14.4C33 10 27 3 18 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13.5 12.5c-.3-.6-.6-.6-.9-.6-.3 0-.5 0-.8.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.2 2.5 1 3 .8 3.5.7.5-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3-.3-.2-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.1z" fill="currentColor"/>
    </svg>
  );
}

function IconMedium() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="12.5" cy="18" rx="4.5" ry="6" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="23" cy="18" rx="2" ry="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="29.5" cy="18" rx="1" ry="5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconDribbble() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 13c3 1 7 2 11 1.5M10 30c1-4 4-8 9-10M21 4c-2 4-3 9-2 16M32 22c-3-1-6-1.5-10-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Crosshair location pin (matches Figma's group icon, rotate-135)
────────────────────────────────────────────────────────────── */
function LocationPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
      <circle cx="12" cy="12" r="8.3" stroke="currentColor"/>
      <line x1="11.7" y1="0" x2="11.7" y2="24" stroke="currentColor"/>
      <line x1="24" y1="11.7" x2="0" y2="11.7" stroke="currentColor"/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Social link with hover opacity + slight lift
────────────────────────────────────────────────────────────── */
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        color: "var(--ink)",
        opacity: hovered ? 1 : 0.55,
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [mapHovered, setMapHovered] = useState(false);

  return (
    <>
      <Navigation />

      {/* Breathing grid background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <GridBackground />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 20px 48px",
        }}
      >
        {/* Main content — centered in the available space */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, width: "100%" }}>

        {/* Heading */}
        <div
          style={{
            paddingBottom: 10,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <h1
            className="font-caslon"
            style={{
              fontSize: "clamp(28px, 2.5vw, 36px)",
              color: "var(--ink)",
              letterSpacing: "0.01em",
            }}
          >
            Let&rsquo;s get in touch
          </h1>
        </div>

        {/* Phone */}
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "baseline",
          }}
        >
          <span
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.53vw, 22px)",
              fontStyle: "italic",
              color: "var(--ink)",
            }}
          >
            phone:
          </span>
          <a
            href="tel:+420601338213"
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.53vw, 22px)",
              fontWeight: 500,
              color: "var(--ink)",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            +420 601 338 213
          </a>
        </div>

        {/* Email */}
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "baseline",
          }}
        >
          <span
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.53vw, 22px)",
              fontStyle: "italic",
              color: "var(--ink)",
            }}
          >
            email:
          </span>
          <a
            href="mailto:dxgratza@gmail.com"
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.53vw, 22px)",
              fontWeight: 500,
              color: "var(--ink)",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            dxgratza@gmail.com
          </a>
        </div>

        {/* CV button + resumé label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            paddingTop: 60,
            paddingBottom: 110,
          }}
        >
          <PillCTA href="/cv" label="CV" />
          <span
            className="font-futura"
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--ink-muted)",
            }}
          >
            (resumé)
          </span>
        </div>

        {/* Czech Republic map */}
        <div
          onMouseEnter={() => setMapHovered(true)}
          onMouseLeave={() => setMapHovered(false)}
          style={{
            position: "relative",
            width: 324,
            height: 184,
            cursor: "default",
            flexShrink: 0,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Outline map — default state */}
          <img
            src="/images/contact/map.svg"
            alt="Czech Republic map"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: mapHovered ? 0 : 1,
              transition: "opacity 0.35s ease",
            }}
          />

          {/* Filled dark map — hover state */}
          <img
            src="/images/contact/map-dark.svg"
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: mapHovered ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
          />

          {/* Prague crosshair pin — color flips with hover */}
          <div
            style={{
              position: "absolute",
              left: 94,
              top: 63,
              color: mapHovered ? "#ffffff" : "var(--ink)",
              opacity: mapHovered ? 1 : 0.85,
              transform: mapHovered ? "rotate(45deg)" : "rotate(0deg)",
              transition: "color 0.35s ease, opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <LocationPin />
          </div>

          {/* Coordinates — appear on hover in white */}
          <div
            style={{
              position: "absolute",
              left: 123,
              top: 88,
              opacity: mapHovered ? 1 : 0,
              transform: mapHovered ? "translateX(0)" : "translateX(10px)",
              transition: "opacity 0.35s ease 0.1s, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
              pointerEvents: "none",
            }}
          >
            <p
              className="font-futura"
              style={{
                fontSize: 10,
                color: "#ffffff",
                opacity: 0.9,
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}
            >
              N&nbsp;&nbsp;50° 03&apos; 52&quot;<br />
              E&nbsp;&nbsp;14° 27&apos; 09&quot;
            </p>
          </div>
        </div>

        {/* Location label */}
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "baseline",
          }}
        >
          <span
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.53vw, 22px)",
              fontStyle: "italic",
              color: "var(--ink)",
            }}
          >
            location:
          </span>
          <span
            className="font-futura"
            style={{
              fontSize: "clamp(16px, 1.53vw, 22px)",
              fontWeight: 500,
              color: "var(--ink)",
            }}
          >
            Prague, Czech Republic
          </span>
        </div>

        </div>{/* end main content */}

        {/* Social icons — pinned to bottom */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            padding: 10,
          }}
        >
          <SocialLink href="https://www.linkedin.com/in/daniel-gratza-82b893210/" label="LinkedIn">
            <IconLinkedIn />
          </SocialLink>
          <SocialLink href="https://www.instagram.com/dxgratza/" label="Instagram">
            <IconInstagram />
          </SocialLink>
          <SocialLink href="https://wa.me/420601338213" label="WhatsApp">
            <IconWhatsApp />
          </SocialLink>
          <SocialLink href="https://medium.com/@danielgratza" label="Medium">
            <IconMedium />
          </SocialLink>
          <SocialLink href="https://dribbble.com/danielgratza" label="Dribbble">
            <IconDribbble />
          </SocialLink>
        </div>
      </div>
    </>
  );
}
