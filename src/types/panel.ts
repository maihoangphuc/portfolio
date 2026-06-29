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
