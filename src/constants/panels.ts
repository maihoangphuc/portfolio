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
    title: "Fastboy\nMarketing",
    label: "Experience",
    placement: "bottom",
    year: "2025",
    month: "Jul",
    description:
      "Frontend Developer (Middle) · Jul 2025 – Present\n\nLed frontend of a **Social Automation Tool**, reducing **manual posting effort by ~70%** through **automated publishing and scheduling across 3 platforms**, with integrated **AI-powered caption and media generation**.\n\nStandardized the team's **AI-assisted development workflow** (reusable **agents**, **skills** and **conventions**), reducing **onboarding time** for new features and **speeding up delivery** across the team.\n\n**Stack:** Vue 3, Tailwind CSS, Element Plus, Claude AI.",
  },
  {
    url: "/images/panel-ies.webp",
    title: "IES",
    label: "Experience",
    placement: "bottom",
    year: "2024",
    month: "Jan",
    endMonth: "May",
    endYear: "2025",
    description:
      "Frontend Developer (Junior) · Jan 2024 – May 2025\n\nBuilt **20+ modules** for **Magichands Admin** and hit a **92+ Lighthouse score** by optimizing **render flow**, **reducing bundle size** and adding **lazy loading**.\n\nDesigned and integrated **RESTful APIs** for the **Airport Transfer** service — enabling **booking and scheduling** of **one-way** and **round-trip** transfers.\n\n**Stack:** Next.js, AdonisJS, TypeScript, Ant Design, Zustand, Tailwind CSS.",
  },
  {
    url: "/images/panel-teso.webp",
    title: "TESO",
    label: "Experience",
    placement: "bottom",
    year: "2022",
    month: "Sep",
    endMonth: "Dec",
    endYear: "2023",
    description:
      "Frontend Developer (Fresher) · Sep 2022 – Dec 2023\n\nDeveloped the **CleverTube admin dashboard**, streamlining **content operations** by centralizing management of **video lessons**, **vocabulary**, **quizzes** and **pronunciation** features.\n\nDeveloped **15+ reusable components** within a **component-driven architecture**, improving **UI consistency** and reducing **duplicate code** across the dashboard.\n\n**Stack:** TypeScript, React.js, TanStack Query, Chakra UI.",
  },
  {
    url: "/images/panel-binhduong.webp",
    title: "Binh Duong",
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
    placement: "bottom",
    year: "2025",
    description:
      "**Frameworks:**JavaScript, TypeScript, React.js, Next.js, Vue.js.\n\n**State management:** TanStack Query, Zustand, Redux, Pinia.\n\n**Styling:** Tailwind CSS, Ant Design, Material UI, SCSS.",
  },
  {
    url: "/images/panel-backend.webp",
    title: "Backend",
    label: "Skills",
    placement: "bottom",
    year: "2025",
    description:
      "**Node.js**\n\n**AdonisJS**\n\nRESTful API** design & integration",
  },
  {
    url: "/images/panel-database.webp",
    title: "Database",
    label: "Skills",
    placement: "bottom",
    year: "2025",
    description: "**PostgreSQL**\n\n**SQL Server**",
  },
  {
    url: "/images/panel-ai.webp",
    title: "Tools",
    label: "Skills",
    placement: "bottom",
    year: "2025",
    description: "**Git**\n\n**Vite**\n\n**Postman**\n\n**Claude AI**",
  },
];
