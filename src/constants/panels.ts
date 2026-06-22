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
  /** Vertical placement of the title label on the panel (it always hangs half
   *  off the left edge). "top" / "center" / "bottom" — defaults to "center".
   *  Greta-style: vary it per panel so titles don't all sit at the same height. */
  placement?: "top" | "center" | "bottom";
};

// One panel per major chapter/section of the CV — the projects, achievements
// and individual tools live in each panel's `description` (shown in the
// click-to-open modal), not as separate panels.
export const PANELS: PanelItem[] = [
  {
    url: "/images/panel-fastboy.webp",
    title: "Fastboy\nMarketing Company",
    label: "Experience",
    placement: "bottom",
    year: "2025",
    month: "Jul",
    description:
      "Frontend Developer (Middle) · Jul 2025 – Present\n\nDeveloping a **Social Media Automation Tool** for **multi-platform publishing** and **post scheduling** — improving **content-management efficiency 3×** over native platform workflows.\n\nBuilt reusable **Claude Code agents**, **skills**, **rules** and **project conventions** that streamlined engineering workflows and accelerated feature development.\n\n**Stack:** Vue 3, TailwindCSS, Element Plus, Claude AI.",
  },
  {
    url: "/images/panel-ies.webp",
    title: "IES\nCompany",
    label: "Experience",
    placement: "bottom",
    year: "2024",
    month: "Jan",
    endMonth: "May",
    endYear: "2025",
    description:
      "Frontend Developer (Junior) · Jan 2024 – May 2025\n\nBuilt **20+ modules** for **Magichands Admin**, reaching a **92+ Lighthouse Performance score** by optimizing **rendering flow**, **reducing bundle size** and implementing **lazy loading**.\n\nDeveloped and integrated **RESTful APIs** with **AdonisJS** for the **Transfer Airport** service — **one-way** and **round-trip** airport-transfer booking and scheduling.\n\n**Stack:** Next.js 14, AdonisJS, TypeScript, Ant Design, Zustand, TailwindCSS 3.",
  },
  {
    url: "/images/panel-teso.webp",
    title: "TESO\nCompany",
    label: "Experience",
    placement: "bottom",
    year: "2022",
    month: "Sep",
    endMonth: "Dec",
    endYear: "2023",
    description:
      "Frontend Developer (Fresher) · Sep 2022 – Dec 2023\n\nBuilt and maintained the **CleverTube admin dashboard** for **video-based English lessons**, **vocabulary**, **quizzes** and **pronunciation-learning** features.\n\nDesigned **15+ reusable components** on a **component-driven architecture** and optimized **data fetching with React Query**, improving **maintainability and UI consistency** across the platform.\n\n**Stack:** TypeScript, ReactJS, React Query, Vue 3, Pinia, Chakra UI.",
  },
  {
    url: "/images/panel-binhduong.webp",
    title: "Binh Duong\nUniversity",
    label: "Education",
    placement: "bottom",
    year: "2017",
    month: "Aug",
    endMonth: "Jul",
    endYear: "2022",
    description: "BSc in Software Technology · Aug 2017 – Jul 2022",
  },
  {
    url: "/images/panel-frontend.webp",
    title: "Frontend",
    label: "Skills",
    placement: "center",
    year: "2025",
    description:
      "**Core:** HTML/CSS, JavaScript (ES6+), TypeScript.\n\n**Frameworks:** ReactJS 18+, Next.js 14+, Vue 3.\n\n**State & data:** Zustand, Pinia, React Query.\n\n**Styling:** Tailwind CSS, Ant Design, Material UI, SCSS.",
  },
  {
    url: "/images/panel-backend.webp",
    title: "Backend",
    label: "Skills",
    placement: "bottom",
    year: "2025",
    description:
      "**APIs:** RESTful API design and integration.\n\n**Runtime:** Node.js, AdonisJS.\n\nBuilt and integrated **booking & scheduling** services end-to-end.",
  },
  {
    url: "/images/panel-database.webp",
    title: "Database",
    label: "Skills",
    placement: "top",
    year: "2025",
    description:
      "**Databases:** PostgreSQL, SQL Server.\n\nSchema design, queries and data modeling for production apps.",
  },
  {
    url: "/images/panel-ai.webp",
    title: "AI",
    label: "Skills",
    placement: "center",
    year: "2025",
    description:
      "**AI-assisted development:** Claude AI woven into the daily workflow.\n\nBuilt reusable **Claude Code agents**, **skills**, **rules** and **project conventions** that streamlined engineering and accelerated delivery.",
  },
];
