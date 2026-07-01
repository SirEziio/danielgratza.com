"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

interface Props {
  hideLogo?: boolean;
  lightNav?: boolean;
  scrolledPastHero?: boolean;
}

export default function Navigation({ hideLogo, lightNav, scrolledPastHero = true }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const linkStyle: React.CSSProperties = lightNav ? { color: "rgba(255,255,255,0.88)" } : {};

  const iconColor = lightNav ? "rgba(255,255,255,0.88)" : "var(--ink)";

  return (
    <>
      {/* iOS 26 Liquid Glass — status bar zone fix.
          env(safe-area-inset-top, 0px) = 0 on desktop/Android → invisible.
          On iPhone it equals the status bar height and gives the glass
          a consistent dark backdrop instead of neutralising the page bg. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "env(safe-area-inset-top, 0px)",
          background: "rgba(0,0,0,0.28)",
          zIndex: 200,
          pointerEvents: "none",
        }}
      />

      <header
        className="site-header"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "max(20px, calc(14px + env(safe-area-inset-top, 0px))) var(--page-pad) 20px",
          pointerEvents: "none",
        }}
      >
        {/* Logo */}
        {!hideLogo && (
          <div className="site-nav-logo" style={{ position: "absolute", left: "var(--page-pad)", pointerEvents: "auto" }}>
            <Link href="/" style={{ display: "block", lineHeight: 0 }}>
              <img
                src="/images/home-Logo.png"
                alt="DG"
                className={`nav-logo${lightNav ? " nav-logo-light" : ""}`}
                style={{ width: 36, height: 36, display: "block" }}
              />
            </Link>
          </div>
        )}

        {/* Desktop centre nav */}
        <nav className="nav-links nav-desktop" style={{ display: "flex", alignItems: "center", gap: "1.5rem", pointerEvents: "auto" }}>
          {[
            { href: "/", label: "Home", active: isActive("/") && pathname === "/" },
            { href: "/portfolio", label: "Portfolio", active: isActive("/portfolio") || isActive("/case-study") },
            { href: "/about", label: "About", active: isActive("/about") },
            { href: "/contact", label: "Contact", active: isActive("/contact") },
          ].map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${active ? " active" : ""}${lightNav ? " nav-link-light" : ""}`}
              style={linkStyle}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop theme toggle */}
        <div className="nav-desktop" style={{ position: "absolute", right: "var(--page-pad)", pointerEvents: "auto" }}>
          <ThemeToggle />
        </div>

        {/* Mobile hamburger button */}
        <button
          className="nav-mobile site-nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            position: "absolute",
            right: "var(--page-pad)",
            background: "none",
            // CSS override via .site-nav-hamburger in globals.css
            border: "none",
            cursor: "pointer",
            padding: 6,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            zIndex: 110,
          }}
        >
          <span style={{
            display: "block", width: 24, height: 1.5,
            background: menuOpen ? "var(--ink)" : iconColor,
            transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
            transition: "transform 0.3s ease, background 0.3s ease",
          }} />
          <span style={{
            display: "block", width: 24, height: 1.5,
            background: menuOpen ? "var(--ink)" : iconColor,
            opacity: menuOpen ? 0 : 1,
            transition: "opacity 0.2s ease, background 0.3s ease",
          }} />
          <span style={{
            display: "block", width: 24, height: 1.5,
            background: menuOpen ? "var(--ink)" : iconColor,
            transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
            transition: "transform 0.3s ease, background 0.3s ease",
          }} />
        </button>
      </header>

      {/* Mobile menu backdrop */}
      <div
        className="nav-mobile"
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          // transparent in the safe-area-inset-top zone so the glass
          // keeps seeing page content (e.g. dark case-study hero) behind it
          background: "linear-gradient(to bottom, transparent 0px, transparent env(safe-area-inset-top, 0px), rgba(0,0,0,0.3) env(safe-area-inset-top, 0px))",
          zIndex: 120,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Mobile slide-in panel */}
      <div
        className="nav-mobile"
        style={{
          position: "fixed",
          top: 0, right: 0,
          width: "72vw",
          maxWidth: 300,
          height: "100dvh",
          // transparent in status-bar zone, panel bg below it
          background: "linear-gradient(to bottom, transparent 0px, transparent env(safe-area-inset-top, 0px), var(--bg) env(safe-area-inset-top, 0px))",
          zIndex: 130,
          display: "flex",
          flexDirection: "column",
          padding: "80px 32px 48px",
          gap: 8,
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: menuOpen ? "-8px 0 32px rgba(0,0,0,0.12)" : "none",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="18" y1="2" x2="2" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {[
          { href: "/", label: "Home" },
          { href: "/portfolio", label: "Portfolio" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ].map(({ href, label }, i) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            className={`nav-link${isActive(href) && (href !== "/" || pathname === "/") ? " active" : ""}`}
            style={{
              fontSize: "1.4rem",
              fontWeight: 400,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateX(0)" : "translateX(20px)",
              transition: `opacity 0.35s ease ${i * 60 + 100}ms, transform 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 60 + 100}ms`,
            }}
          >
            {label}
          </Link>
        ))}

        {/* Theme toggle at bottom */}
        <div style={{
          marginTop: "auto",
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? "translateX(0)" : "translateX(20px)",
          transition: `opacity 0.35s ease 340ms, transform 0.35s ease 340ms`,
        }}>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
