import { PANELS } from "@/constants/panels";

// One scene panel per CV chapter — no repeats. Per-panel spacing/tilt/opacity is
// pinned to the original layout via LAYOUT_SPAN in panels.ts, so fewer panels
// still sit and move exactly like the original 40-panel helix.
export const N = PANELS.length;
export const C = 7;

export const PW = 4.5;
export const PH = 2.61;

// Tailwind `lg` breakpoint (px). Single source of truth for the responsive
// switch shared by the CSS `@media` query, panels.ts, and models.ts.
export const LG_BREAKPOINT = 1024;

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;