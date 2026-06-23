// ─── Chapter block types ──────────────────────────────────────────
export type ChapterBlock =
  | { type: "meta"; timeline: string; position: string; tools: string[] }
  | { type: "overview"; leftText: string; rightHeading: string; rightItems: string[] }
  | { type: "dark-quote"; text: string }
  | { type: "two-col-bullets"; leftHeading: string; leftItems: string[]; rightHeading: string; rightItems: string[] }
  | { type: "image-row"; images: string[] }
  | { type: "two-col-findings"; leftHeading: string; leftItems: string[]; rightHeading: string; findings: { num: string; text: string }[] }
  | { type: "process-steps"; steps: string[] }
  | { type: "two-col-text"; leftHeading: string; leftText: string; rightHeading: string; rightText: string }
  | { type: "metrics-takeaways"; metricsHeading: string; metrics: { num: string; text: string }[]; image?: string; takeawaysHeading: string; takeaways: string }
  // v2 blocks
  | { type: "challenge-icons"; challenges: { label: string; icon: "wrench" | "clock" | "book" | "briefcase" }[] }
  | { type: "reflection"; text: string };

export interface CaseStudyChapter {
  id: string;
  num: number;       // 1–5, use 4.5 for "four and half"
  title: string;
  darkBg?: boolean;  // v2: chapter renders on dark background
  blocks: ChapterBlock[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  thumbnail: string;         // URL or path
  coverImage: string;
  role: string;
  timeline: string;
  tools: string;
  year: number;
  accentColor: string;       // per-project accent
  version?: 1 | 2;           // case study template version
  sections: CaseStudySection[];
  chapters?: CaseStudyChapter[];
}

export interface CaseStudySection {
  id: string;
  type: "intro" | "text" | "images" | "quote" | "metrics" | "outro";
  heading?: string;
  body?: string;
  images?: string[];
  quote?: string;
  metrics?: { label: string; value: string }[];
}

export interface TimelineEntry {
  year: string;
  org: string;
  role: string;
  type: "education" | "work";
  dotColor: string;
  current?: boolean;
}
