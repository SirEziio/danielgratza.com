"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The reading rail — fixed on the left of the post (desktop only).
 * A large Caslon chapter numeral flips as you cross each heading, a
 * vertical ember track fills with your progress through the article,
 * waypoint ticks mark every section (clickable, keyboard-accessible),
 * and a small percent readout sits at the bottom.
 *
 * Sections are derived from the rendered headings; the intro (before
 * the first heading) counts as chapter 01. Posts without headings get
 * the track + percent only.
 */

interface Chapter {
  text: string;
  top: number;  // document offset
  pos: number;  // 0..1 along the article
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function PostRail() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(1);
  const bounds = useRef({ top: 0, height: 1 });

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".journal-article");
    if (!article) return;

    const measure = () => {
      const rect = article.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = Math.max(article.offsetHeight, 1);
      bounds.current = { top, height };
      const heads = Array.from(
        article.querySelectorAll<HTMLElement>(".journal-h1, .journal-h2")
      );
      setChapters(
        heads.map((h) => {
          const hTop = h.getBoundingClientRect().top + window.scrollY;
          return {
            text: h.textContent ?? "",
            top: hTop,
            pos: Math.min(Math.max((hTop - top) / height, 0), 1),
          };
        })
      );
    };

    let raf = 0;
    const apply = () => {
      raf = 0;
      const { top, height } = bounds.current;
      const marker = window.scrollY + window.innerHeight * 0.35;
      setProgress(Math.min(Math.max((marker - top) / height, 0), 1));
      let passed = 0;
      const heads = Array.from(
        article.querySelectorAll<HTMLElement>(".journal-h1, .journal-h2")
      );
      for (const h of heads) {
        if (h.getBoundingClientRect().top + window.scrollY <= marker) passed++;
      }
      setCurrent(passed + 1); // intro = chapter 01
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // images loading shift offsets — re-measure a few times
    measure();
    apply();
    const t1 = window.setTimeout(onResize, 600);
    const t2 = window.setTimeout(onResize, 2000);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
    };
  }, []);

  const total = chapters.length + 1;

  const goTo = (c: Chapter) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: c.top - 110,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <nav className="journal-rail" aria-label="Reading progress">
      <p className="journal-rail-no" aria-hidden>
        {/* key remount replays the flip animation on chapter change */}
        <span key={current} className="journal-rail-current font-caslon">
          {chapters.length > 0 ? pad(current) : `${Math.round(progress * 100)}`}
        </span>
        <span className="journal-rail-total">
          {chapters.length > 0 ? `of ${pad(total)}` : "%"}
        </span>
      </p>

      <div className="journal-rail-track">
        <div
          className="journal-rail-fill"
          style={{ transform: `scaleY(${progress})` }}
        />
        {chapters.map((c, i) => (
          <button
            key={i}
            className={`journal-rail-tick${progress >= c.pos ? " passed" : ""}${
              current === i + 2 ? " active" : ""
            }`}
            style={{ top: `${c.pos * 100}%` }}
            onClick={() => goTo(c)}
            aria-label={`Jump to section: ${c.text}`}
          />
        ))}
      </div>

      {chapters.length > 0 && (
        <p className="journal-rail-pct" aria-hidden>
          {Math.round(progress * 100)}%
        </p>
      )}
    </nav>
  );
}
