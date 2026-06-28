import { readRootCssVar } from "@/utils/rootCssColor";
import { Dom } from "@/lib/experience/runtime/types";

const APP_FONT_CSS_VAR = "--font-roboto";

export function getDom(): Dom {
  const must = <T extends HTMLElement>(id: string) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el as T;
  };

  return {
    bg: must<HTMLCanvasElement>("bg"),
    loaderChar: must<HTMLCanvasElement>("loader-char"),
    c: must<HTMLCanvasElement>("c"),
    modelLoadPct: must("model-load-pct"),
    month: must("month-lbl"),
    monthGhost: must("month-lbl-ghost"),
    yearLbl: must("year-lbl"),
    timeline: must("timeline"),
    tlProgress: must("tl-progress"),
    introLeft: must("intro-left"),
    introRuleTrack: must("intro-rule-track"),
    introRight: must("intro-right"),
    bgName: must("bg-name"),
    soundBtn: must("sound-btn"),
    soundPermission: must("sound-permission"),
    soundPermissionBtn: must("sound-permission-btn"),
    social: must("social"),
    sline: must("sline"),
    exploreBtn: must("explore-btn"),
    brand: must("brand"),
    dragHint: must("drag-hint"),
    panelModal: must("panel-modal"),
    panelModalBackdrop: must("panel-modal-backdrop"),
    panelModalClose: must("panel-modal-close"),
    panelModalImg: must<HTMLImageElement>("panel-modal-img"),
    panelModalTitle: must("panel-modal-title"),
    panelModalMeta: must("panel-modal-meta"),
    panelModalMetaRole: must("panel-modal-meta-role"),
    panelModalMetaDate: must("panel-modal-meta-date"),
    panelModalDesc: must("panel-modal-desc"),
    panelModalIndex: must("panel-modal-index"),
  };
}

export function canvasFont(
  sizePx: number,
  weight: number | "bold" = 400,
): string {
  const stack = getComputedStyle(document.documentElement)
    .getPropertyValue(APP_FONT_CSS_VAR)
    .trim();
  const family = stack || "sans-serif";
  const w = weight === "bold" ? "bold" : String(weight);
  return `${w} ${sizePx}px ${family}`;
}

export function positionSocialLine(
  dom: Dom,
  target: HTMLElement,
  widthFactor = 1,
) {
  const x = target.offsetLeft;
  dom.sline.style.transform = `translateX(${x}px) scaleX(${widthFactor})`;
  dom.sline.style.opacity = "0.85";
}
