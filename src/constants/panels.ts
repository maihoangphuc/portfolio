export type PanelItem = {
  url: string;
  title: string;
  /** CV section this panel belongs to (Objective / Experience / Education /
   *  Skills). Shown as the small top label; consecutive panels in the same
   *  section share it, so it only swaps when the section changes. */
  label: string;
  /** Year for this panel — shown as the big bottom label, swapping per panel. */
  year: string;
  /** Optional month/start tag shown small at the top-left of the year. */
  month?: string;
  /** End of this chapter's date range (the start is `month`/`year`). The bottom
   *  date scrubber sweeps within [start, end] while this panel is centered, so it
   *  never bleeds into a neighbouring panel's era. Omit on the newest panel to
   *  mean "Present" (the scrubber uses the current month). */
  endMonth?: string;
  endYear?: string;
  /** Body copy shown in the panel detail modal. Newlines render as line breaks
   *  (the modal desc uses `white-space: pre-line`), so use them to separate
   *  the period, the highlights and the tech stack. */
  description?: string;
};

// One panel per major chapter/section of the CV — the projects, achievements
// and individual tools live in each panel's `description` (shown in the
// click-to-open modal), not as separate panels.
export const PANELS: PanelItem[] = [
  {
    url: "https://picsum.photos/seed/124/800/464",
    title: "Fastboy\nMarketing",
    label: "Experience",
    year: "2025",
    month: "Jul",
    description:
      "Frontend Developer (Middle) · Jul 2025 – Present\n\nDeveloping a Social Media Automation Tool for multi-platform publishing and post scheduling — improving content-management efficiency 3× over native platform workflows.\n\nBuilt reusable Claude Code agents, skills, rules and project conventions that streamlined engineering workflows and accelerated feature development.\n\nStack: Vue 3, TailwindCSS, Element Plus, Claude AI.",
  },
  {
    url: "https://picsum.photos/seed/126/800/464",
    title: "IES\nCompany",
    label: "Experience",
    year: "2024",
    month: "Jan",
    endMonth: "May",
    endYear: "2025",
    description:
      "Frontend Developer (Junior) · Jan 2024 – May 2025\n\nBuilt 20+ modules for Magichands Admin, reaching a 92+ Lighthouse Performance score by optimizing rendering flow, reducing bundle size and implementing lazy loading.\n\nDeveloped and integrated RESTful APIs with AdonisJS for the Transfer Airport service — one-way and round-trip airport-transfer booking and scheduling.\n\nStack: Next.js 14, AdonisJS, TypeScript, Ant Design, Zustand, TailwindCSS 3.",
  },
  {
    url: "https://picsum.photos/seed/129/800/464",
    title: "TESO\nCompany",
    label: "Experience",
    year: "2022",
    month: "Sep",
    endMonth: "Dec",
    endYear: "2023",
    description:
      "Frontend Developer (Fresher) · Sep 2022 – Dec 2023\n\nBuilt and maintained the CleverTube admin dashboard for video-based English lessons, vocabulary, quizzes and pronunciation-learning features.\n\nDesigned 15+ reusable components on a component-driven architecture and optimized data fetching with React Query, improving maintainability and UI consistency across the platform.\n\nStack: TypeScript, ReactJS, React Query, Vue 3, Pinia, Chakra UI.",
  },
  {
    url: "https://picsum.photos/seed/133/800/464",
    title: "Binh Duong\nUniversity",
    label: "Education",
    year: "2017",
    month: "Aug",
    endMonth: "Jul",
    endYear: "2022",
    description: "BSc in Software Technology · Aug 2017 – Jul 2022",
  },
  {
    url: "https://picsum.photos/seed/138/800/464",
    title: "Frontend\ncraft",
    label: "Skills",
    year: "2025",
    description:
      "Core: HTML/CSS, JavaScript (ES6+), TypeScript.\n\nFrameworks: ReactJS 18+, Next.js 14+, Vue 3.\n\nState & data: Zustand, Pinia, React Query.",
  },
  {
    url: "https://picsum.photos/seed/141/800/464",
    title: "Styling\n& UI",
    label: "Skills",
    year: "2025",
    description:
      "Design systems and pixel-accurate interfaces.\n\nTailwind CSS, Ant Design, Material UI, Chakra UI, SCSS.",
  },
  {
    url: "https://picsum.photos/seed/145/800/464",
    title: "Tools\n& workflow",
    label: "Skills",
    year: "2025",
    description:
      "Git, Vite, ESLint, Prettier, Postman — with Claude AI woven into the daily workflow.\n\nDatabase: PostgreSQL, SQL Server.",
  },
  {
    url: "https://picsum.photos/seed/148/800/464",
    title: "Design",
    label: "Skills",
    year: "2025",
    description:
      "Bridging the gap between design and development.\n\nAdobe Photoshop, Figma, Blender.",
  },
];
