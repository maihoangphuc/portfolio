import * as THREE from "three";
import { FigureParticles } from "@/lib/experience/runtime/particles";

export type Dom = {
  bg: HTMLCanvasElement;
  loaderChar: HTMLCanvasElement;
  c: HTMLCanvasElement;
  modelLoadPct: HTMLElement;
  month: HTMLElement;
  monthGhost: HTMLElement;
  yearLbl: HTMLElement;
  timeline: HTMLElement;
  tlProgress: HTMLElement;
  introLeft: HTMLElement;
  introRuleTrack: HTMLElement;
  introRight: HTMLElement;
  bgName: HTMLElement;
  soundBtn: HTMLElement;
  soundPermission: HTMLElement;
  soundPermissionBtn: HTMLElement;
  social: HTMLElement;
  sline: HTMLElement;
  exploreBtn: HTMLElement;
  brand: HTMLElement;
  dragHint: HTMLElement;
  panelModal: HTMLElement;
  panelModalBackdrop: HTMLElement;
  panelModalClose: HTMLElement;
  panelModalImg: HTMLImageElement;
  panelModalTitle: HTMLElement;
  panelModalMeta: HTMLElement;
  panelModalMetaRole: HTMLElement;
  panelModalMetaDate: HTMLElement;
  panelModalDesc: HTMLElement;
  panelModalIndex: HTMLElement;
};

export type State = {
  introActive: boolean;
  startupIntroSpinActive: boolean;
  startupIntroSpinStartMs: number;
  introPreviewActive: boolean;
  introPreviewStartMs: number;
  experienceEntryActive: boolean;
  experienceEntryStartMs: number;
  timelineDatesVisible: boolean;
  entryScrollFrom: number;
  entryScrollTo: number;
  isPaused: boolean;
  scrolled: boolean;
  scrollCurrent: number;
  scrollTarget: number;
  scrollVel: number;
  scrollVelVis: number;
  figRotY: number;
  figScale: number;
  figPosY: number;
  lastMonthIndex: number | null;
  lastFiForMonth: number | null;
  pendingMonthIndex: number | null;
  pendingFiForMonth: number | null;
  nextMonthSwitchAt: number;
  experienceExitActive: boolean;
  experienceExitStartMs: number;
  exitScroll0: number;
  exitFigRot0: number;
  exitFigRot1: number;
  exitWasEntryMidSpin: boolean;
  exitReverseMode: boolean;
  scrollForLayoutLast: number;
  exitFigPosY0: number;
  exitFigScale0: number;
  exitBgYaw0: number;
  bgYawLast: number;
  modelLoadTargetPct: number;
  modelLoadStartMs: number;
  modelLoadRealFloor: number;
  modelLoadCrawlPct: number;
  modelLoadDisplayPct: number;
  lastRenderedLoadPct: number;
  lastModelLoadUiMs: number;
  isDragging: boolean;
  lastX: number;
  mouseX: number;
  mouseY: number;
  modalOpen: boolean;
  modalIndex: number;
};

export type GretaBackground = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  material: THREE.ShaderMaterial;
  resize: () => void;
  render: () => void;
};

export type RuntimeContext = {
  dom: Dom;
  state: State;
  bg: GretaBackground;
  scene: THREE.Scene;
  cam: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  /** Shader-driven dust points around the figure; set once models load. */
  particles: FigureParticles | null;
  figureGroup: { value: THREE.Group | null };
  panelGroup: THREE.Group;
  /** Wavy "p" letter shown while models load; null once its fade-out ends. */
  loaderChar: {
    update: () => boolean;
    startHide: () => void;
    dispose: () => void;
  } | null;
  timers: {
    introLineReveal?: number;
    exploreCommit?: number;
    timelineReveal?: number;
    dragHintShow?: number;
    dragHintHide?: number;
    introRotateStart?: number;
    yearMonthReveal?: number;
    entryStart?: number;
    loadComplete?: number;
    loadReveal?: number;
  };
  animFlags: {
    introLinesAnimEndMs: number;
    exploreCommitPending: boolean;
    socialLineAnimated: boolean;
  };
  events: any;
};
