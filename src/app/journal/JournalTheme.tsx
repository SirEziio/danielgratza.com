"use client";

import { useEffect, useLayoutEffect } from "react";

const JOURNAL_BG = "#171210";

// useLayoutEffect runs before paint (no theme flash on client-side
// navigation); swap to useEffect on the server to avoid the SSR warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Applies the journal's nocturnal theme by setting `data-journal` on <html>.
 * An inline script in layout.tsx sets it pre-paint on hard loads; this
 * component covers client-side navigation (pre-paint via layout effect)
 * and cleans up synchronously on unmount, before the next page paints.
 */
export default function JournalTheme() {
  useIsomorphicLayoutEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-journal", "");

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevColor = meta?.content ?? null;
    if (meta) meta.content = JOURNAL_BG;

    return () => {
      html.removeAttribute("data-journal");
      if (meta && prevColor) meta.content = prevColor;
    };
  }, []);

  return null;
}
