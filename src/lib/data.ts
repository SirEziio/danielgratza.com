import { CaseStudy, TimelineEntry, CaseStudyChapter } from "./types";

export type PortfolioItem = {
  slug: string;
  title: string;
  tags: string[];
  date: string;
  description: string;
  coverImage?: string;
  iconBg: string;
  iconSrc?: string;
};

export const portfolioItems: PortfolioItem[] = [
  {
    slug: "ab-testing-liveport",
    title: "Livesport AB Testing",
    tags: ["CRO", "UX Design", "AB Testing"],
    date: "28th Mar 2025",
    description: "Extensive AB testing optimization of a multi-national product",
    coverImage: "/images/cs-liveport-cover.png",
    iconBg: "#e00b0b",
    iconSrc: "/images/icon-livesport.png",
  },
  {
    slug: "personal-brand",
    title: "Personal Brand",
    tags: ["Brand", "UX Design", "UX Research"],
    date: "19th Feb 2024",
    description: "Building a cohesive personal design identity and brand system",
    coverImage: "/images/cs-brand-cover.png",
    iconBg: "#242424",
    iconSrc: "/images/icon-brand.png",
  },
  {
    slug: "ambienten-vip",
    title: "Ambienten VIP",
    tags: ["Brand", "Graphic Design", "Print"],
    date: "31st Jul 2022",
    description: "Visual design and brand materials for a premium interior design studio",
    coverImage: "/images/cs-ambienten-cover.png",
    iconBg: "#9B8B6E",
    iconSrc: "/images/icon-ambienten.png",
  },
  {
    slug: "hunterra",
    title: "Hunterra",
    tags: ["UX Design", "Mobile", "App Design"],
    date: "15th Nov 2023",
    description: "Designing the UX for an outdoor navigation and hunting companion app",
    coverImage: "/images/cs-hunterra-cover.png",
    iconBg: "#3B5E3A",
    iconSrc: "/images/icon-hunterra.png",
  },
  {
    slug: "reddit-viz",
    title: "Reddit Visualizations",
    tags: ["Data Viz", "UI Design", "Research"],
    date: "5th Apr 2024",
    description: "Turning Reddit community data into interactive visual stories",
    coverImage: "/images/cs-reddit-cover.png",
    iconBg: "#FF4500",
    iconSrc: "/images/icon-reddit.png",
  },
  {
    slug: "arma4-inventory",
    title: "Arma4 Inventory System",
    tags: ["Game UI", "UX Design", "Icons"],
    date: "12th Jan 2025",
    description: "Designing immersive UI elements for a modern military tactical shooter",
    coverImage: "/images/cs-arma4-cover.png",
    iconBg: "#2D3626",
    iconSrc: "/images/icon-arma4.png",
  },
];

// ─── Chapters for each case study ─────────────────────────────────

const liveportChapters: CaseStudyChapter[] = [
  {
    id: "background",
    num: 1,
    title: "Background & Context",
    blocks: [
      {
        type: "meta",
        timeline: "1 year 3 months",
        position: "CRO Specialist",
        tools: ["Figma", "HTML / CSS / JS", "Optimizely"],
      },
      {
        type: "overview",
        leftText:
          "As a UX-focused CRO specialist at Livesport, I was embedded in a high-traffic product with millions of daily users across Europe. My role sat at the intersection of data analysis, UX thinking, and rapid experimentation — working alongside product managers, engineers, and analysts to test hypotheses and validate UI changes through controlled A/B experiments.",
        rightHeading: "Key Objectives",
        rightItems: [
          "Optimise UI components to improve usability and feature discoverability",
          "Drive measurable uplifts in key engagement metrics like CTR and session depth",
          "Support feature rollout by validating ideas through rigorous experimentation",
          "Build a repeatable testing framework scalable across multiple product verticals",
        ],
      },
    ],
  },
  {
    id: "problem",
    num: 2,
    title: "Problem Statement",
    blocks: [
      {
        type: "dark-quote",
        text:
          "With a massive global user base, Livesport needed to continuously refine its interface without disrupting the experience for millions of active users — a challenge requiring data precision, UX empathy, and deep understanding of user intent.",
      },
      {
        type: "two-col-bullets",
        leftHeading: "User Pain Points",
        leftItems: [
          "Users frequently missed newly released features due to unclear placement and low discoverability",
          "Mobile-first needs required UI simplifications without sacrificing speed or information density",
          "Personalisation was difficult to achieve with the existing rigid, static layout system",
        ],
        rightHeading: "Business Challenges",
        rightItems: [
          "Balancing feature promotion with core performance and page-load speed",
          "Prioritising changes in a high-velocity, multi-team release cycle",
          "Ensuring new features provided measurable uplift before any full-scale rollout",
        ],
      },
    ],
  },
  {
    id: "research",
    num: 3,
    title: "Research & Discovery",
    blocks: [
      {
        type: "image-row",
        images: ["/images/cs-liveport-1.jpg", "/images/cs-liveport-2.jpg", "/images/cs-liveport-3.jpg"],
      },
      {
        type: "two-col-findings",
        leftHeading: "Methods",
        leftItems: [
          "User behaviour data via GA4 and Microsoft Clarity — heatmaps, click maps, scroll depth",
          "UX audits to identify friction in navigation, visual hierarchy, and key interactions",
          "Stakeholder alignment sessions on business goals, priorities, and success metrics",
          "Quantitative analysis of funnel drop-off to locate highest-impact intervention points",
        ],
        rightHeading: "Key Findings",
        findings: [
          { num: "#1", text: "Small visual tweaks — rewording a CTA or repositioning a badge — often had a disproportionately large effect on CTR" },
          { num: "#2", text: "97% of web traffic came from mobile, meaning desktop-first assumptions consistently undermined test validity" },
          { num: "#3", text: "Positioning CTAs near live-event or betting elements increased engagement by up to 34% in controlled tests" },
        ],
      },
    ],
  },
  {
    id: "process",
    num: 4,
    title: "Design Process",
    blocks: [
      {
        type: "process-steps",
        steps: ["Define", "Research", "Analyse", "Design", "Test & Iterate"],
      },
      {
        type: "two-col-text",
        leftHeading: "Ideation",
        leftText:
          "Each experiment began with a clear hypothesis grounded in observed user behaviour. I sketched multiple variants — from microcopy changes to full component rearrangements — then narrowed to the two or three most promising candidates for development. Design decisions were always tied back to a measurable metric.",
        rightHeading: "Execution",
        rightText:
          "Variants were built in Figma and handed off to engineers as interactive prototypes. I wrote the front-end implementation specs and collaborated closely during QA to ensure pixel-level accuracy. Post-launch, I monitored statistical significance and documented learnings to feed the next cycle.",
      },
    ],
  },
  {
    id: "results",
    num: 5,
    title: "Results & Impact",
    blocks: [
      {
        type: "metrics-takeaways",
        metricsHeading: "Deliverables, Metrics & KPIs",
        metrics: [
          { num: "#1", text: "+18% overall conversion uplift across the tested funnel" },
          { num: "#2", text: "−31% drop-off rate at the seat-selection and match-detail steps" },
          { num: "#3", text: "−22 s average checkout completion time after layout optimisations" },
          { num: "#4", text: "12 shipped A/B experiments with documented, statistically significant results" },
        ],
        image: "/images/cs-liveport-4.jpg",
        takeawaysHeading: "Takeaways",
        takeaways:
          "Microcopy and progressive disclosure consistently outperform full visual redesigns when iterating on a mature, high-traffic product. The key discipline is measurement rigour — every design decision earns its place through data, not intuition alone. Small, validated bets compound rapidly at scale.",
      },
    ],
  },
];

const brandChapters: CaseStudyChapter[] = [
  {
    id: "background",
    num: 1,
    title: "Background & Context",
    blocks: [
      {
        type: "meta",
        timeline: "6 months",
        position: "Solo Designer",
        tools: ["Figma", "Adobe CC", "Framer"],
      },
      {
        type: "overview",
        leftText:
          "Building my personal brand was a long-term, iterative process shaped by both self-exploration and a growing design maturity. It started as an attempt to unify how I presented myself across different platforms — portfolio, CV, social media, and client materials — but evolved into a deeper reflection of my values as a designer.",
        rightHeading: "Key Objectives",
        rightItems: [
          "Create a cohesive visual identity that communicates personality, craft, and professional intent",
          "Design a scalable system that works across digital and print touchpoints",
          "Build the portfolio site as the living centrepiece of the identity",
          "Iterate openly, documenting versions to show process maturity over time",
        ],
      },
    ],
  },
  {
    id: "problem",
    num: 2,
    title: "Problem Statement",
    blocks: [
      {
        type: "dark-quote",
        text:
          "Designing for yourself is the hardest brief. There is no client to push back on your overthinking — only you. The challenge was to create something that felt both personal and professional, honest and aspirational, without falling into the trap of endless revision.",
      },
      {
        type: "two-col-bullets",
        leftHeading: "Personal Challenges",
        leftItems: [
          "Infinite creative freedom led to scope creep and perfectionism paralysis",
          "Balancing a clean, modern aesthetic with a distinct, recognisable personality",
          "Avoiding the clichés of designer portfolios while still meeting audience expectations",
        ],
        rightHeading: "Strategic Constraints",
        rightItems: [
          "The brand needed to evolve gracefully as my skills and positioning matured",
          "All assets had to be producible solo, without a full production team",
          "The identity had to stand out in a competitive, saturated market for UX designers",
        ],
      },
    ],
  },
  {
    id: "research",
    num: 3,
    title: "Research & Discovery",
    blocks: [
      {
        type: "image-row",
        images: ["/images/cs-brand-1.jpg", "/images/cs-brand-2.jpg", "/images/cs-brand-3.jpg"],
      },
      {
        type: "two-col-findings",
        leftHeading: "Methods",
        leftItems: [
          "Competitor audits across 40+ designer portfolios to map conventions and differentiation opportunities",
          "Personal values mapping — articulating what I stand for as a designer and practitioner",
          "Moodboarding across typography, motion, colour, and layout references",
          "Feedback sessions with peers and senior designers on early direction explorations",
        ],
        rightHeading: "Key Findings",
        findings: [
          { num: "#1", text: "Most designer portfolios over-index on work quantity — a curated, depth-first approach stands out more" },
          { num: "#2", text: "Typography is the most powerful differentiator in personal brand identity for UX designers" },
          { num: "#3", text: "The rarest combination in the market was a clean, modern aesthetic paired with genuine warmth and editorial flair" },
        ],
      },
    ],
  },
  {
    id: "process",
    num: 4,
    title: "Design Process",
    blocks: [
      {
        type: "process-steps",
        steps: ["Values Mapping", "Moodboarding", "Typography", "Colour & Layout", "System Build"],
      },
      {
        type: "two-col-text",
        leftHeading: "Identity Direction",
        leftText:
          "The visual identity wasn't built in one go — it took several iterations, influenced by skill growth, feedback, and shifting inspiration. The final system landed on a pairing of Big Caslon CC (editorial, confident, slightly unconventional) with Futura PT (rational, structured, clean). This tension between classical and modernist became the brand's defining character.",
        rightHeading: "System Application",
        rightText:
          "From the typeface pairing, I derived a full system: grid structure, spacing scale, colour palette, iconography principles, and motion language. The portfolio site itself became the primary testbed — every design decision had to survive in the real, interactive environment before making it into the system documentation.",
      },
    ],
  },
  {
    id: "results",
    num: 5,
    title: "Results & Impact",
    blocks: [
      {
        type: "metrics-takeaways",
        metricsHeading: "Deliverables, Metrics & KPIs",
        metrics: [
          { num: "#1", text: "Complete brand identity system: logomark, typeface pairing, colour palette, grid, and motion principles" },
          { num: "#2", text: "Live portfolio website built in Next.js with full dark mode and responsive layout" },
          { num: "#3", text: "CV, cover letter, and client proposal templates derived from the system" },
          { num: "#4", text: "Measurable increase in inbound client inquiries after the brand launch" },
        ],
        image: "/images/cs-brand-4.jpg",
        takeawaysHeading: "Takeaways",
        takeaways:
          "What emerged is a minimalistic, modern brand system with a tech-savvy backbone and a subtle editorial flair. The most important lesson: constraints are a gift. Narrowing the identity to a single, well-reasoned tension — classical type meets modernist grid — made every subsequent decision easier and the system feel coherent.",
      },
    ],
  },
];

const ambientenChapters: CaseStudyChapter[] = [
  {
    id: "background",
    num: 1,
    title: "Background & Context",
    blocks: [
      {
        type: "meta",
        timeline: "8 months",
        position: "Graphic Designer",
        tools: ["Illustrator", "Photoshop", "InDesign"],
      },
      {
        type: "overview",
        leftText:
          "Ambienten VIP is a premium interior design and décor studio based in Brno. As their in-house graphic designer, I was responsible for the full suite of brand collateral — from client-facing proposals and lookbooks to signage systems, product labels, and social media templates. The brief was to elevate visual communication across all touchpoints to match the studio's positioning in the luxury segment.",
        rightHeading: "Key Objectives",
        rightItems: [
          "Create a cohesive print and digital identity system aligned with a luxury interior brand",
          "Design high-quality client-facing materials — lookbooks, proposals, mood boards",
          "Build a reusable template system to speed up client deliverables without sacrificing quality",
          "Establish consistent visual standards across all physical and digital touchpoints",
        ],
      },
    ],
  },
  {
    id: "problem",
    num: 2,
    title: "Problem Statement",
    blocks: [
      {
        type: "dark-quote",
        text:
          "The studio had grown quickly but its brand materials lagged behind — inconsistent typefaces, ad-hoc layouts, and no central visual system. Every client proposal looked different. The challenge was to impose cohesion without losing the warmth and uniqueness that defined the studio's work.",
      },
      {
        type: "two-col-bullets",
        leftHeading: "Studio Challenges",
        leftItems: [
          "No established template system — every deliverable was designed from scratch",
          "Brand materials lacked a consistent hierarchy and typographic voice",
          "Print production was error-prone due to inconsistent use of colour profiles and bleed settings",
        ],
        rightHeading: "Design Constraints",
        rightItems: [
          "All templates had to be editable by non-designers using InDesign or PowerPoint",
          "The premium aesthetic required careful balance between restraint and richness",
          "Turnaround times for client proposals were often under 48 hours",
        ],
      },
    ],
  },
  {
    id: "research",
    num: 3,
    title: "Research & Discovery",
    blocks: [
      {
        type: "image-row",
        images: ["/images/cs-ambienten-1.jpg", "/images/cs-ambienten-2.jpg", "/images/cs-ambienten-3.jpg"],
      },
      {
        type: "two-col-findings",
        leftHeading: "Methods",
        leftItems: [
          "Audit of all existing brand materials to catalogue inconsistencies and quality issues",
          "Competitor review of 15+ luxury interior studios in Central Europe",
          "Interviews with studio principals on brand values, aspirational references, and pain points",
          "Client feedback analysis from past proposals to identify what resonated and what fell flat",
        ],
        rightHeading: "Key Findings",
        findings: [
          { num: "#1", text: "The most cited reference by clients was restraint — less visual noise, more white space and craftsmanship" },
          { num: "#2", text: "Proposals that included rendered mood board spreads converted significantly better than text-only documents" },
          { num: "#3", text: "Consistency in paper weight and print finish mattered as much as the graphic design to the target client" },
        ],
      },
    ],
  },
  {
    id: "process",
    num: 4,
    title: "Design Process",
    blocks: [
      {
        type: "process-steps",
        steps: ["Audit", "Direction", "Type & Colour", "Templates", "Print Production"],
      },
      {
        type: "two-col-text",
        leftHeading: "Visual Direction",
        leftText:
          "I began by establishing a restrained typographic system using a single serif family for headlines and a humanist sans for body copy. The colour palette was anchored in warm neutrals — off-whites, warm greys, and a single deep accent — derived directly from the studio's material palette of stone, linen, and dark wood.",
        rightHeading: "Template System",
        rightText:
          "I produced a library of 14 InDesign and PowerPoint templates covering proposals, lookbooks, signage specs, and social media content. Each template was built on a strict 12-column grid with locked margin guides, ensuring even non-designer staff could produce consistent output. Print files were standardised to ISO-compliant CMYK profiles across all formats.",
      },
    ],
  },
  {
    id: "results",
    num: 5,
    title: "Results & Impact",
    blocks: [
      {
        type: "metrics-takeaways",
        metricsHeading: "Deliverables & Impact",
        metrics: [
          { num: "#1", text: "14-template library covering proposals, lookbooks, signage, and social content" },
          { num: "#2", text: "Reduced proposal production time from ~6 hours to under 90 minutes per document" },
          { num: "#3", text: "Zero print-production errors in the 6 months following system adoption" },
          { num: "#4", text: "Client conversion rate on proposals increased noticeably after the lookbook redesign" },
        ],
        image: "/images/cs-ambienten-4.jpg",
        takeawaysHeading: "Takeaways",
        takeaways:
          "Premium brand work is as much about consistency and craft as about visual originality. The biggest win wasn't a single beautiful piece — it was building a system that let an entire team produce beautiful pieces reliably. The discipline of designing for non-designers taught me more about clarity and constraint than almost any client-facing project.",
      },
    ],
  },
];

const hunterraChapters: CaseStudyChapter[] = [
  {
    id: "background",
    num: 1,
    title: "Background & Context",
    blocks: [
      {
        type: "meta",
        timeline: "3 months",
        position: "UX / UI Designer",
        tools: ["Figma", "Maze", "Jira"],
      },
      {
        type: "overview",
        leftText:
          "Hunterra is a mobile companion app for hunters and outdoor enthusiasts, used by event designers, venue operators, and installation artists. I was brought in to lead a full UX redesign — the legacy product had grown organically for five years without a dedicated designer, resulting in an information architecture that confused even power users.",
        rightHeading: "Key Objectives",
        rightItems: [
          "Reduce task completion time for core workflows by at least 30%",
          "Restructure the information architecture around how users actually think about their spaces",
          "Build a scalable component library to reduce design drift across future feature development",
          "Validate every major decision through user testing before engineering handoff",
        ],
      },
    ],
  },
  {
    id: "problem",
    num: 2,
    title: "Problem Statement",
    blocks: [
      {
        type: "dark-quote",
        text:
          "The legacy Brightly interface was structured around device types — controllers, fixtures, zones — but users thought in terms of spaces and scenes. This fundamental mismatch between product architecture and mental models was the root cause of nearly every support ticket and usability complaint.",
      },
      {
        type: "two-col-bullets",
        leftHeading: "User Pain Points",
        leftItems: [
          "Finding the right fixture required navigating three nested menus with inconsistent naming",
          "Creating a new scene meant repeatedly cross-referencing different sections of the app",
          "New users required over 40 minutes of onboarding before completing their first successful configuration",
        ],
        rightHeading: "Business Challenges",
        rightItems: [
          "Support costs were climbing — 55% of tickets were navigational or discoverability issues",
          "Churn at the 30-day mark correlated directly with first-session confusion and failed setups",
          "Engineering velocity was slowed by the lack of a consistent design system and reusable components",
        ],
      },
    ],
  },
  {
    id: "research",
    num: 3,
    title: "Research & Discovery",
    blocks: [
      {
        type: "image-row",
        images: ["/images/cs-hunterra-1.jpg", "/images/cs-hunterra-2.jpg", "/images/cs-hunterra-3.jpg"],
      },
      {
        type: "two-col-findings",
        leftHeading: "Methods",
        leftItems: [
          "12 in-depth user interviews with a mix of new users, power users, and churned customers",
          "Card-sorting exercise with 24 participants to understand mental models of space and device organisation",
          "Session recordings analysis: 150+ hours of Maze usability tests on key task flows",
          "Heuristic evaluation across the full application surface with a severity-rated issues register",
        ],
        rightHeading: "Key Findings",
        findings: [
          { num: "#1", text: "Users mentally organise their work by location first, then by scene — never by device type" },
          { num: "#2", text: "The three most-used features were buried 3+ clicks deep; the most prominent menu items were rarely used" },
          { num: "#3", text: "A single, consistent spatial hierarchy (Space → Zone → Scene → Fixture) resolved 80% of navigation confusion" },
        ],
      },
    ],
  },
  {
    id: "process",
    num: 4,
    title: "Design Process",
    blocks: [
      {
        type: "process-steps",
        steps: ["IA Restructure", "Wireframes", "Component Library", "Prototypes", "User Testing"],
      },
      {
        type: "two-col-text",
        leftHeading: "Architecture & Ideation",
        leftText:
          "The first month was entirely structural — no visual design, just information architecture. I mapped all 94 distinct actions in the legacy app, clustered them by mental model, and proposed three alternative navigation structures. Stakeholder validation and a second round of card sorting narrowed these to one clear winner: Space-first navigation with contextual fixture panels.",
        rightHeading: "Component System",
        rightText:
          "With IA locked, I built a component library of 48 core components before designing a single screen. This discipline paid off — when the engineering team later added three new features, they required zero design debt to accommodate. The final prototype was tested with 18 participants, achieving 94% task success rate on the three primary workflows.",
      },
    ],
  },
  {
    id: "results",
    num: 5,
    title: "Results & Impact",
    blocks: [
      {
        type: "metrics-takeaways",
        metricsHeading: "Deliverables, Metrics & KPIs",
        metrics: [
          { num: "#1", text: "−40% task completion time across the three primary user workflows in moderated testing" },
          { num: "#2", text: "−55% support ticket volume in the 60 days following launch, attributed to navigation improvements" },
          { num: "#3", text: "+23 NPS points in the first post-launch survey cycle (from 18 to 41)" },
          { num: "#4", text: "48-component design system adopted by the full engineering team within 6 weeks of handoff" },
        ],
        image: "/images/cs-hunterra-4.jpg",
        takeawaysHeading: "Takeaways",
        takeaways:
          "Restructuring information architecture is invisible when done right — users just feel smarter. The biggest insight was that speed comes from clarity of structure, not from UI animation or visual polish. When users know exactly where to look, the interface disappears. That invisibility is the goal.",
      },
    ],
  },
];

// ─── Arma4 Inventory System — v2 case study ───────────────────────
const arma4Chapters: CaseStudyChapter[] = [
  {
    id: "background",
    num: 1,
    title: "Background & Context",
    darkBg: true,
    blocks: [
      {
        type: "meta",
        timeline: "2 weeks",
        position: "UX / UI Designer",
        tools: ["Figma", "Illustrator", "Photoshop"],
      },
      {
        type: "overview",
        leftText:
          "This two-part assignment was part of a design challenge for a UI/UX position on a tactical shooter game. The first task focused on creating a stylized and immersive military rank iconset, while the second required a UX/UI design for an in-game inventory screen. Both tasks aimed to evaluate the candidate's ability to balance functionality with visual style, while respecting player expectations and genre conventions.\n\nDespite the tight timeframe, I approached each task as a complete design study — researching real-world references, ideating different approaches, and iterating toward a polished, game-ready outcome. The challenge allowed me to apply both my UX and visual design skills, blending usability with immersive aesthetics.",
        rightHeading: "Key Objectives",
        rightItems: [
          "Design a set of 5 cohesive and progressive rank icons with military/fictional flair",
          "Create a user-friendly inventory screen optimized for player experience and gameplay flow",
          "Ensure visual and functional consistency with the game's tone and world",
          "Use real-world references to inspire believable UI with strong affordances",
          "Deliver high-fidelity visuals with clear UI hierarchy, textures, and iconography",
        ],
      },
    ],
  },
  {
    id: "problem",
    num: 2,
    title: "Problem Statement",
    darkBg: false,
    blocks: [
      {
        type: "dark-quote",
        text: "Design immersive and functional UI elements for a realistic military shooter, focusing on rank progression and inventory clarity",
      },
      {
        type: "two-col-bullets",
        leftHeading: "User Pain Points",
        leftItems: [
          "UI often feels cluttered and hard to read",
          "Inventory systems are unintuitive under pressure",
          "Rank progression lacks satisfying visual feedback",
          "Interfaces break immersion in a realistic setting",
        ],
        rightHeading: "Business Challenges",
        rightItems: [
          "Balance realism with usability",
          "Support scalable and modular asset design",
          "Improve player retention through rewarding systems",
          "Stand out in a competitive genre with strong visual identity",
        ],
      },
      {
        type: "challenge-icons",
        challenges: [
          { label: "Engine problem", icon: "wrench" },
          { label: "Time constrain", icon: "clock" },
          { label: "Steep learning curve", icon: "book" },
          { label: "Intense Workload", icon: "briefcase" },
        ],
      },
    ],
  },
  {
    id: "research",
    num: 3,
    title: "Research and Discovery",
    darkBg: false,
    blocks: [
      {
        type: "image-row",
        images: ["/images/cs-arma4-1.jpg", "/images/cs-arma4-2.jpg", "/images/cs-arma4-3.jpg"],
      },
      {
        type: "two-col-findings",
        leftHeading: "Methods",
        leftItems: [
          "UI systems of current games and in military and tactical shooters (e.g., Arma 3, Escape from Tarkov)",
          "Real-life military insignia and rank systems",
          "Gamified progression systems and reward psychology",
          "Inventory UX patterns under stress and time pressure",
          "Visual styles that support immersion in high-realism games",
        ],
        rightHeading: "Key Findings",
        findings: [
          { num: "#1", text: "Players need fast, intuitive interfaces — especially under stress" },
          { num: "#2", text: "Clear icon progression improves motivation and retention" },
          { num: "#3", text: "Real-world insignia and textures (e.g., stitched cloth, polished metal) enhance perceived realism" },
        ],
      },
    ],
  },
  {
    id: "process",
    num: 4,
    title: "Design Process",
    darkBg: true,
    blocks: [
      {
        type: "process-steps",
        steps: ["Define", "Research", "Analyze", "Design", "Test & Iterate"],
      },
      {
        type: "two-col-text",
        leftHeading: "Ideation",
        leftText:
          "For both the Inventory UI and Rank Iconset, I grounded my exploration in military realism, taking inspiration from real-world insignia, tactical gear layouts, and modern game UIs. I envisioned a visual language rooted in dark green, grey, and black tones, evoking the serious tone of war while maintaining clarity and immersion. I also drew influence from systems like Baldur's Gate 3 for tooltip handling and user onboarding.\n\nConcept\nFor the Inventory System, I began by defining the core elements and structuring the Information Architecture (IA) to create clear interaction zones. Once areas were defined, I developed a wireframe-based design system and applied the chosen color palette early on to evaluate contrast and readability.",
        rightHeading: "",
        rightText:
          "I progressively placed and refined components — though not fully polished, the system remains presentable and scalable thanks to its modularity.\n\nVisually, I explored the liquid dark glass trend — a metaphor for both the modern tactical interface and the fragility of the human body in war. Weapons and gear are envisioned as 3D greyscale models, colorizing when upgraded to enhance feedback. A right-hand panel surfaces detailed item info and interactions, ideal for both mouse and console controls.\n\nFor the Rank Iconset, I combined cloth-based insignia with medal elements to create a distinct progression between ranks. The system leverages classic military symbolism — stripes, stars, pins — and increases in visual complexity and material prestige.",
      },
    ],
  },
  {
    id: "process-2",
    num: 4.5,
    title: "Design Process pt.2",
    darkBg: true,
    blocks: [
      {
        type: "process-steps",
        steps: ["Define", "Research", "Analyze", "Design", "Test & Iterate"],
      },
      {
        type: "reflection",
        text: "I acknowledge that the current rank icon set still feels slightly immature and doesn't yet fully capture the seriousness and grounded tone I intended for a realistic military setting. Due to time constraints, it remains at the concept art level, but I believe it provides a strong foundation.\n\nWith further iteration — refining shadows, muting the color palette, adding texture depth, and sharpening edge details — the icons could evolve into a polished, production-ready system that aligns more closely with the intended visual direction and immersive gameplay experience.",
      },
      {
        type: "image-row",
        images: ["/images/cs-arma4-4.jpg", "/images/cs-arma4-5.jpg", "/images/cs-arma4-6.jpg"],
      },
    ],
  },
  {
    id: "results",
    num: 5,
    title: "Results and Impact",
    darkBg: true,
    blocks: [
      {
        type: "metrics-takeaways",
        metricsHeading: "Deliverables, Metrics and KPIs",
        metrics: [
          { num: "#1", text: "Scalable 5-tier military rank icons with clear hierarchy" },
          { num: "#2", text: "Modular dark-glass inventory with intuitive layout" },
          { num: "#3", text: "Reusable dark-tone design system for prototyping, scalability and future modularity and upgrades" },
        ],
        image: "/images/cs-arma4-cover.png",
        takeawaysHeading: "Takeaways",
        takeaways:
          "This project was a challenging yet rewarding dive into tactical UI design. It pushed me to balance visual storytelling, realism, and player clarity — within a tight deadline. I gained hands-on experience in developing a design system from scratch, applying concept art into usable interface components, and critically reflecting on tone and audience. With more time, I would elevate visual fidelity and polish, but the result already stands as a meaningful UX case rooted in thoughtful structure and theme.",
      },
    ],
  },
];


const redditChapters: CaseStudyChapter[] = [
  {
    id: "background",
    num: 1,
    title: "Background & Context",
    blocks: [
      {
        type: "meta",
        timeline: "6 weeks",
        position: "Data Visualisation Designer",
        tools: ["Figma", "Python", "D3.js"],
      },
      {
        type: "overview",
        leftText:
          "Reddit Visualizations started as a personal project to explore what large-scale community data looks like when translated into visual form. Using publicly available Reddit API data, I designed a series of interactive and static visualisations examining how information spreads, how communities form, and how sentiment shifts across different subreddits over time.",
        rightHeading: "Key Objectives",
        rightItems: [
          "Design visually compelling representations of complex, multi-dimensional Reddit datasets",
          "Tell clear stories with data without sacrificing analytical depth",
          "Explore the intersection of editorial design and data visualisation",
          "Build a reproducible design system for data-heavy screens",
        ],
      },
    ],
  },
  {
    id: "problem",
    num: 2,
    title: "Problem Statement",
    blocks: [
      {
        type: "dark-quote",
        text:
          "Reddit data is inherently messy — millions of posts, votes, and comments with inconsistent structure and high noise. The design challenge was to surface meaningful signal without oversimplifying, while making the output readable to a general audience with no data science background.",
      },
      {
        type: "two-col-bullets",
        leftHeading: "Data Challenges",
        leftItems: [
          "High data dimensionality — posts, votes, comments, users, timestamps, subreddits",
          "Extreme variance in volume: viral posts vs. niche community threads",
          "Temporal patterns that required both macro and micro-level views simultaneously",
        ],
        rightHeading: "Design Challenges",
        rightItems: [
          "Avoiding chart junk while still making visualisations feel rich and explorable",
          "Designing for both screen and print export without sacrificing detail",
          "Communicating uncertainty and scale without confusing casual readers",
        ],
      },
    ],
  },
  {
    id: "research",
    num: 3,
    title: "Research & Discovery",
    blocks: [
      {
        type: "image-row",
        images: ["/images/cs-reddit-1.jpg", "/images/cs-reddit-2.jpg", "/images/cs-reddit-3.jpg"],
      },
      {
        type: "two-col-findings",
        leftHeading: "Methods",
        leftItems: [
          "Reddit API data collection across 20 subreddits over a 6-month period",
          "Reference research: Information is Beautiful, The Pudding, NYT graphics team",
          "Exploratory data analysis in Python (pandas, matplotlib) to understand distributions",
          "Iterative sketching — 30+ thumbnail sketches before committing to a direction",
        ],
        rightHeading: "Key Findings",
        findings: [
          { num: "#1", text: "Upvote patterns follow a power law — a handful of posts dominate engagement in every subreddit" },
          { num: "#2", text: "Sentiment shifts dramatically within the first 2 hours of a post going live, then stabilises" },
          { num: "#3", text: "Network graphs of cross-subreddit user activity revealed surprisingly tight community clusters" },
        ],
      },
    ],
  },
  {
    id: "process",
    num: 4,
    title: "Design Process",
    blocks: [
      {
        type: "process-steps",
        steps: ["Data Collect", "Explore", "Sketch", "Design", "Iterate"],
      },
      {
        type: "two-col-text",
        leftHeading: "Visual Language",
        leftText:
          "I built a design system around a dark background with a constrained accent palette — one colour per data dimension, never more than four in a single chart. Typography was set in a monospace face for data labels and a humanist sans for editorial copy, maintaining the technical register of the subject matter while remaining readable.",
        rightHeading: "Chart Types",
        rightText:
          "The project produced five distinct visualisation types: a sentiment timeline, an upvote distribution histogram, a cross-community network graph, a posting-frequency heatmap, and an editorial scroll-story combining annotated charts with narrative text. Each was designed as a standalone piece but used a shared component vocabulary.",
      },
    ],
  },
  {
    id: "results",
    num: 5,
    title: "Results & Impact",
    blocks: [
      {
        type: "metrics-takeaways",
        metricsHeading: "Deliverables & Outcomes",
        metrics: [
          { num: "#1", text: "5 distinct visualisation pieces across timeline, network, heatmap, and distribution formats" },
          { num: "#2", text: "Shared data viz design system: colour scale, typography, grid, and annotation conventions" },
          { num: "#3", text: "Published scroll-story featured in a data design community showcase" },
          { num: "#4", text: "Python + Figma pipeline fully documented for reproducibility on new datasets" },
        ],
        image: "/images/cs-reddit-4.jpg",
        takeawaysHeading: "Takeaways",
        takeaways:
          "Data visualisation is fundamentally a design problem, not a technical one. The hardest decisions weren't about which chart type to use — they were about what story to tell and what to leave out. The best visualisations in this project were the ones where I removed the most: every extra label, gridline, or colour that didn't serve the narrative made the whole weaker.",
      },
    ],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "ab-testing-liveport",
    title: "AB Testing in Livesport",
    subtitle: "Optimising conversion through data-driven experimentation",
    thumbnail: "/images/cs-liveport-thumb.png",
    coverImage: "/images/cs-liveport-cover.png",
    role: "CRO Specialist",
    timeline: "1 Year 3 Months",
    tools: "Figma · Optimizely · GA4",
    year: 2024,
    accentColor: "#CC0000",
    chapters: liveportChapters,
    sections: [
      { id: "intro", type: "intro", heading: "AB Testing in Livesport", body: "How structured experiments improved conversion rate by 18% without a single full redesign." },
      { id: "context", type: "text", heading: "Context", body: "Livesport is one of the largest live-entertainment platforms in Central Europe. My role sat at the intersection of data analysis, UX thinking, and rapid experimentation." },
      { id: "images-1", type: "images", images: ["/images/cs-liveport-1.jpg", "/images/cs-liveport-2.jpg"] },
      { id: "metrics", type: "metrics", metrics: [{ label: "Conversion uplift", value: "+18%" }, { label: "Drop-off", value: "−31%" }, { label: "Checkout time", value: "−22s" }] },
      { id: "images-2", type: "images", images: ["/images/cs-liveport-3.jpg", "/images/cs-liveport-4.jpg"] },
      { id: "outro", type: "outro", heading: "Key Takeaway", body: "Microcopy and progressive disclosure beat visual redesigns every time in a mature product." },
    ],
  },
  {
    slug: "personal-brand",
    title: "Building My Personal Brand",
    subtitle: "A long-term iterative process of self-expression through design",
    thumbnail: "/images/cs-brand-thumb.png",
    coverImage: "/images/cs-brand-cover.png",
    role: "Solo Designer",
    timeline: "6 Months",
    tools: "Figma · Adobe CC · Framer",
    year: 2024,
    accentColor: "#242424",
    chapters: brandChapters,
    sections: [
      { id: "intro", type: "intro", heading: "Building My Personal Brand", body: "Building my personal brand was a long-term, iterative process shaped by self-exploration and growing design maturity." },
      { id: "motivation", type: "text", heading: "Motivation", body: "It started as an attempt to unify how I presented myself across platforms — portfolio, CV, social media — but evolved into a deeper reflection of my values as a designer." },
      { id: "images-1", type: "images", images: ["/images/cs-brand-1.jpg", "/images/cs-brand-2.jpg"] },
      { id: "identity", type: "text", heading: "Visual Identity", body: "The visual identity wasn't built in one go. It took several iterations, influenced by skill growth, feedback, and inspiration from the design community." },
      { id: "quote", type: "quote", quote: "What emerged is a minimalistic and modern brand system with a tech-savvy backbone and a subtle creative flair." },
      { id: "images-2", type: "images", images: ["/images/cs-brand-3.jpg", "/images/cs-brand-4.jpg"] },
      { id: "outro", type: "outro", heading: "What I Learned", body: "Designing for yourself is the hardest brief. There is no client to push back on your overthinking — only you." },
    ],
  },
  {
    slug: "ambienten-vip",
    title: "Ambienten VIP",
    subtitle: "Visual design and brand collateral for a premium interior design studio",
    thumbnail: "/images/cs-ambienten-thumb.png",
    coverImage: "/images/cs-ambienten-cover.png",
    role: "Graphic Designer",
    timeline: "8 Months",
    tools: "Illustrator · Photoshop · InDesign",
    year: 2022,
    accentColor: "#9B8B6E",
    chapters: ambientenChapters,
    sections: [
      { id: "intro", type: "intro", heading: "Ambienten VIP", body: "Building a cohesive print and digital identity system for a luxury interior design studio." },
      { id: "context", type: "text", heading: "The Brief", body: "The studio had grown quickly but its brand materials lagged behind — inconsistent typefaces, ad-hoc layouts, and no central visual system." },
      { id: "images-1", type: "images", images: ["/images/cs-ambienten-1.jpg", "/images/cs-ambienten-2.jpg"] },
      { id: "system", type: "text", heading: "System", body: "A 14-template library across proposals, lookbooks, and social content — built on a strict grid, editable by non-designers." },
      { id: "images-2", type: "images", images: ["/images/cs-ambienten-3.jpg", "/images/cs-ambienten-4.jpg"] },
      { id: "outro", type: "outro", heading: "Outcome", body: "Proposal production time cut from 6 hours to 90 minutes. Zero print errors in 6 months post-launch." },
    ],
  },
  {
    slug: "hunterra",
    title: "Hunterra",
    subtitle: "UX design for an outdoor navigation and hunting companion mobile app",
    thumbnail: "/images/cs-hunterra-thumb.png",
    coverImage: "/images/cs-hunterra-cover.png",
    role: "UX/UI Designer",
    timeline: "3 Months",
    tools: "Figma · Maze · Jira",
    year: 2023,
    accentColor: "#3B5E3A",
    chapters: hunterraChapters,
    sections: [
      { id: "intro", type: "intro", heading: "Hunterra", body: "Redesigning the UX of a mobile outdoor companion app — reducing task completion time and increasing user retention." },
      { id: "research", type: "text", heading: "Research Phase", body: "User interviews and card-sorting revealed that hunters organise their experience by terrain and species — not by device type." },
      { id: "images-1", type: "images", images: ["/images/cs-hunterra-1.jpg", "/images/cs-hunterra-2.jpg"] },
      { id: "metrics", type: "metrics", metrics: [{ label: "Task completion time", value: "−40%" }, { label: "Support tickets", value: "−55%" }, { label: "NPS score", value: "+23 pts" }] },
      { id: "images-2", type: "images", images: ["/images/cs-hunterra-3.jpg", "/images/cs-hunterra-4.jpg"] },
      { id: "outro", type: "outro", heading: "Reflection", body: "Restructuring information architecture is invisible when done right. Users just feel smarter." },
    ],
  },
  {
    slug: "reddit-viz",
    title: "Reddit Visualizations",
    subtitle: "Turning Reddit community data into compelling visual stories",
    thumbnail: "/images/cs-reddit-thumb.png",
    coverImage: "/images/cs-reddit-cover.png",
    role: "Data Viz Designer",
    timeline: "6 Weeks",
    tools: "Figma · Python · D3.js",
    year: 2024,
    accentColor: "#FF4500",
    chapters: redditChapters,
    sections: [
      { id: "intro", type: "intro", heading: "Reddit Visualizations", body: "Five editorial visualisations of Reddit community data — how information spreads, communities cluster, and sentiment shifts." },
      { id: "approach", type: "text", heading: "Approach", body: "Using Reddit API data collected over 6 months across 20 subreddits, I designed five distinct chart types using a shared visual language." },
      { id: "images-1", type: "images", images: ["/images/cs-reddit-1.jpg", "/images/cs-reddit-2.jpg"] },
      { id: "images-2", type: "images", images: ["/images/cs-reddit-3.jpg", "/images/cs-reddit-4.jpg"] },
      { id: "outro", type: "outro", heading: "Takeaway", body: "The best visualisations were the ones where I removed the most. Every extra label or colour that didn't serve the narrative made the whole weaker." },
    ],
  },
  {
    slug: "arma4-inventory",
    title: "Arma4 Inventory System",
    subtitle: "Designing immersive and functional UI elements for a modern military game",
    thumbnail: "/images/cs-arma4-thumb.png",
    coverImage: "/images/cs-arma4-cover.png",
    role: "UX / UI Designer",
    timeline: "2 Weeks",
    tools: "Figma · Illustrator · Photoshop",
    year: 2025,
    accentColor: "#4A5240",
    version: 2,
    chapters: arma4Chapters,
    sections: [],
  },
];

export const timelineEntries: TimelineEntry[] = [
  {
    year: "2017",
    org: "Gymnázium Josefa Kainara",
    role: "Secondary education",
    type: "education",
    dotColor: "#888888",
  },
  {
    year: "2020",
    org: "Masaryk University",
    role: "Computer graphics & image processing",
    type: "education",
    dotColor: "#E07B39",
  },
  {
    year: "2021",
    org: "Ambiance VIF",
    role: "Graphic Designer",
    type: "work",
    dotColor: "#5B6BF5",
  },
  {
    year: "2022",
    org: "BonLore",
    role: "Data processing specialist",
    type: "work",
    dotColor: "#3DB87A",
  },
  {
    year: "2022",
    org: "Masaryk University",
    role: "Psychology & Sociology",
    type: "education",
    dotColor: "#E07B39",
  },
  {
    year: "2023",
    org: "Brightly",
    role: "UX/UI Designer",
    type: "work",
    dotColor: "#FF7A00",
  },
  {
    year: "2023",
    org: "Liveport",
    role: "Commerce role optimisation specialist",
    type: "work",
    dotColor: "#FF3366",
  },
  {
    year: "2024",
    org: "T-Mobile CZ",
    role: "Data Scientist",
    type: "work",
    dotColor: "#E4003A",
    current: true,
  },
];
