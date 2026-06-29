import type { PanelItem } from "@/types/panel";

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
      "Frontend Developer (Middle) · Jul 2025 – Present\n\n**Led frontend** of a **Social Automation Tool**, reducing manual posting effort by **~70%** through automated publishing and scheduling across **3 platforms**, with integrated **AI-powered** caption and media generation.\n\n**Standardized the team's AI-assisted development workflow** (reusable agents, skills and conventions), reducing onboarding time for new features and **speeding up delivery across the team**.\n\n**Stack:** Vue 3, Tailwind CSS, Element Plus, Claude AI.",
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
      "Frontend Developer (Junior) · Jan 2024 – May 2025\n\nBuilt **20+ modules** for **Magichands Admin** and hit a **92+ Lighthouse** score by optimizing render flow, reducing bundle size and adding lazy loading.\n\n**Designed and integrated RESTful APIs** for the **Airport Transfer service** — enabling booking and scheduling of one-way and round-trip transfers.\n\n**Stack:** Next.js, AdonisJs, TypeScript, Ant Design, Zustand, Tailwind CSS.",
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
      "Frontend Developer (Fresher) · Sep 2022 – Dec 2023\n\nDeveloped the **CleverTube admin dashboard**, **streamlining content operations** by centralizing management of video lessons, vocabulary, quizzes and pronunciation features.\n\nDeveloped **15+ reusable components** within a component-driven architecture, improving **UI consistency** and reducing **duplicate code** across the dashboard.\n\n**Stack:** TypeScript, React.js, TanStack Query, Chakra UI.",
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
      "**Frameworks:** JavaScript, TypeScript, React.js, Next.js, Vue.js.\n\n**State management:** TanStack Query, Zustand, Redux, Pinia.\n\n**Styling:** Tailwind CSS, Ant Design, Material UI, SCSS.",
  },
  {
    url: "/images/panel-backend.webp",
    title: "Backend",
    label: "Skills",
    placement: "bottom",
    year: "2025",
    description:
      "**Node.js**\n\n**AdonisJs**\n\n**RESTful API** design & integration",
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
    description:
      "**Git**\n\n**Vite**\n\n**Postman**\n\n**Linear**\n\n**Claude AI**",
  },
];
