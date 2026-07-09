import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import JournalTheme from "./JournalTheme";
import JournalBackdrop from "./JournalBackdrop";
import "./journal.css";

export const metadata: Metadata = {
  title: "Journal — Daniel Gratza",
  description: "Field notes, experiments, and late-night thoughts.",
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Pre-paint theme flip on hard loads. The <script> is wrapped in raw
          HTML (not rendered as a React element) so React never sees a script
          tag: the browser executes it while parsing SSR output, and during
          client-side navigation innerHTML-injected scripts are inert by spec —
          JournalTheme covers that case and the cleanup. */}
      <div
        hidden
        aria-hidden
        dangerouslySetInnerHTML={{
          __html: `<script>document.documentElement.setAttribute("data-journal","")</script>`,
        }}
      />
      <JournalTheme />
      <div className="journal-root">
        <div className="journal-vignette" aria-hidden />
        {/* Flashlight: cursor lamplight reveals the grid in the dark */}
        <JournalBackdrop />
        <div className="journal-grain" aria-hidden />
        <Navigation />
        <div className="journal-content">{children}</div>
      </div>
    </>
  );
}
