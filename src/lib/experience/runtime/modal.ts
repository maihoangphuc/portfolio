import * as THREE from "three";
import { RuntimeContext } from "@/lib/experience/runtime/types";
import { PANELS } from "@/constants/panels";

// Panel detail modal, inspired by theyearofgreta.com: a click on a visible,
// front-facing panel opens a fullscreen card with the full-color image, title
// and a description. The runtime owns all show/hide (CLAUDE.md) — React never
// touches it.
//
// Click detection is independent of the drag/flick logic in events.ts: we
// record the pointer-down point and treat a release as a "tap" only when it
// barely moved and happened quickly, so dragging the carousel never opens it.

// A tap is a release within this many CSS px and ms of the press.
const TAP_MAX_MOVE_PX = 6;
const TAP_MAX_MS = 400;

// Warm the browser cache for every panel image up-front. Without this, opening
// the modal sets `img.src` to a URL the browser has never fetched as a DOM
// image (the WebGL textures are a separate request), so it kicks off a network
// load and the picture pops in late. Refs are kept alive in this array so the
// preloaded images aren't garbage-collected before they finish loading.
const _preloaded: HTMLImageElement[] = [];
function preloadPanelImages() {
  if (_preloaded.length) return;
  const seen = new Set<string>();
  for (const item of PANELS) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    const img = new Image();
    img.src = item.url;
    _preloaded.push(img);
  }
}

// Dedicated raycaster/scratch so we never disturb the per-frame hover raycast
// in panels.ts (which reuses ctx.raycaster / ctx.mouse every frame).
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _wp = new THREE.Vector3();

function inExperience(ctx: RuntimeContext): boolean {
  const s = ctx.state;
  return (
    !s.introActive &&
    !s.experienceEntryActive &&
    !s.experienceExitActive &&
    !s.modalOpen
  );
}

// Raycast the click point against panels that are visible and in front of the
// figure (worldZ > 0) — the same hittable set panels.ts hovers. Returns the
// panel's data index, or null when nothing front-facing was hit.
function pickPanelIndex(
  ctx: RuntimeContext,
  clientX: number,
  clientY: number
): number | null {
  _ndc.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  _raycaster.setFromCamera(_ndc, ctx.cam);

  const hittable = ctx.panelGroup.children.filter((c) => {
    const m = c as THREE.Mesh;
    const mat = m.material as THREE.ShaderMaterial;
    if (mat.uniforms.uOpacity.value < 0.2) return false;
    m.getWorldPosition(_wp);
    return _wp.z > 0;
  });

  const hits = _raycaster.intersectObjects(hittable, false);
  if (hits.length === 0) return null;
  return (hits[0].object.userData.index as number) ?? null;
}

function openModal(ctx: RuntimeContext, index: number) {
  const { dom, state } = ctx;
  const item = PANELS[index % PANELS.length];

  state.modalOpen = true;
  state.modalIndex = index;
  // Kill any residual carousel momentum so the scene sits still behind the modal.
  state.scrollVel = 0;
  state.scrollVelVis = 0;

  // Swap the image behind a fade: hide it until the new source has actually
  // decoded, then reveal. With the cache warmed by preloadPanelImages() this is
  // effectively instant; the guard only matters on a cold first open.
  const img = dom.panelModalImg;
  img.classList.add("loading");
  img.alt = item.title.replace(/\n/g, " ");
  img.src = item.url;
  const reveal = () => img.classList.remove("loading");
  if (img.decode) {
    img.decode().then(reveal).catch(reveal);
  } else if (img.complete) {
    reveal();
  } else {
    img.onload = reveal;
  }
  // \n in titles renders as a line break via `white-space: pre-line` in CSS.
  dom.panelModalTitle.textContent = item.title;
  dom.panelModalDesc.textContent = item.description ?? "";
  dom.panelModalIndex.textContent = String((index % PANELS.length) + 1).padStart(2, "0");

  dom.panelModal.classList.add("open");
  dom.panelModal.setAttribute("aria-hidden", "false");
  dom.panelModalClose.focus();
}

function closeModal(ctx: RuntimeContext) {
  const { dom, state } = ctx;
  if (!state.modalOpen) return;
  state.modalOpen = false;
  state.modalIndex = -1;
  dom.panelModal.classList.remove("open");
  dom.panelModal.setAttribute("aria-hidden", "true");
}

export function initModal(ctx: RuntimeContext) {
  const { dom } = ctx;

  preloadPanelImages();

  // Tap tracking for open-on-click. We only consider presses that begin on the
  // main scene canvas, so clicks on UI controls (brand/sound/social) are ignored.
  let downX = 0;
  let downY = 0;
  let downT = 0;
  let downOnCanvas = false;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    downOnCanvas = e.target === dom.c && inExperience(ctx);
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!downOnCanvas) return;
    downOnCanvas = false;
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved > TAP_MAX_MOVE_PX) return;
    if (performance.now() - downT > TAP_MAX_MS) return;
    if (!inExperience(ctx)) return;
    const index = pickPanelIndex(ctx, e.clientX, e.clientY);
    if (index !== null) openModal(ctx, index);
  };

  const onClose = () => closeModal(ctx);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal(ctx);
  };

  // Capture phase: run our tap check before events.ts's bubble-phase handlers.
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("pointerup", onPointerUp, true);
  dom.panelModalBackdrop.addEventListener("click", onClose);
  dom.panelModalClose.addEventListener("click", onClose);
  window.addEventListener("keydown", onKeyDown);

  return {
    open: (index: number) => openModal(ctx, index),
    close: onClose,
    teardown: () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      dom.panelModalBackdrop.removeEventListener("click", onClose);
      dom.panelModalClose.removeEventListener("click", onClose);
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}
