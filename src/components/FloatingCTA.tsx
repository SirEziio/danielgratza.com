"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────
   FloatingCTA — glassy "Let's get in touch" pinned bottom-right.
   Appears after the visitor scrolls, hides again while any footer
   ([data-site-footer]) is on screen, and never shows on /contact.
───────────────────────────────────────────────────────────────── */
export default function FloatingCTA() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setFooterVisible(false);

    /* Only the homepage gates on scroll (its hero owns that corner) —
       everywhere else the CTA is present from the start */
    const isHome = pathname === "/";
    setScrolled(!isHome);

    /* The homepage scrolls inside its snap container; other pages scroll
       the window — listen to whichever exists */
    const snap = document.querySelector<HTMLElement>(".snap-container");
    const check = () => {
      if (!isHome) return;
      const y = snap ? snap.scrollTop : window.scrollY;
      setScrolled(y > window.innerHeight * 0.4);
    };
    check();
    const target: HTMLElement | Window = snap ?? window;
    target.addEventListener("scroll", check, { passive: true });

    /* Hide while any footer is on screen — no duplicate CTAs */
    const footers = document.querySelectorAll("[data-site-footer]");
    const obs = new IntersectionObserver(
      (entries) => setFooterVisible(entries.some((en) => en.isIntersecting)),
      { threshold: 0.15 }
    );
    footers.forEach((f) => obs.observe(f));

    return () => {
      target.removeEventListener("scroll", check);
      obs.disconnect();
    };
  }, [pathname]);

  if (pathname === "/contact" || pathname.startsWith("/contact/")) return null;

  const visible = scrolled && !footerVisible;

  return (
    <a
      href="/contact"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="floating-cta font-futura"
      style={{
        position: "fixed",
        right: "clamp(16px, 3vw, 28px)",
        bottom: "calc(clamp(16px, 3vw, 28px) + env(safe-area-inset-bottom, 0px))",
        zIndex: 40,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 18px",
        color: "var(--ink)",
        fontSize: "0.7rem",
        fontWeight: 400,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        textDecoration: "none",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        pointerEvents: visible ? "auto" : "none",
        transition:
          "opacity 0.4s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.25s ease, background 0.25s ease, color 0.25s ease",
      }}
    >
      Let&rsquo;s get in touch
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        style={{
          opacity: 0.6,
          transition: "transform 0.25s ease",
          transform: hovered ? "translateX(3px)" : "none",
        }}
      >
        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
