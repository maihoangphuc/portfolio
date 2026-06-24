import * as THREE from "three";
import { initGretaBackground } from "@/lib/experience/background/index";
import { bindEvents } from "@/lib/experience/runtime/events";
import { initScene } from "@/lib/experience/runtime/scene";
import { loadModels } from "@/lib/experience/runtime/models";
import { getDom, positionSocialLine } from "@/lib/experience/runtime/ui";
import { createExperienceState, MIN_LOAD_SCREEN_MS } from "@/lib/experience/runtime/world";
import { RuntimeContext } from "@/lib/experience/runtime/types";
import { runIntroPageLineEffects, replaySocialLineEffect, introLinesDurationMs } from "@/lib/experience/runtime/effects";
import { enterExperience, returnToExploreIntro, completeExploreReturnToIntroUi, scheduleIntroLinesWhenUiVisible } from "@/lib/experience/runtime/transitions";
import { createAnimateLoop } from "@/lib/experience/runtime/loop";
import { createPanels } from "@/lib/experience/runtime/panels";
import { initModal } from "@/lib/experience/runtime/modal";
import { createLoaderCharacter, LOADER_CHAR_HIDE_MS } from "@/lib/experience/runtime/loaderCharacter";

export function startExperience() {
  const dom = getDom();
  const state = {
    ...createExperienceState(),
    isDragging: false,
    lastX: 0,
    mouseX: -10,
    mouseY: -10,
    modalOpen: false,
    modalIndex: -1,
  };

  const bg = initGretaBackground(dom.bg);
  const { scene, cam, renderer } = initScene(dom);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-10, -10);

  const ctx: RuntimeContext = {
    dom,
    state,
    bg,
    scene,
    cam,
    renderer,
    raycaster,
    mouse,
    particles: null,
    figureGroup: { value: null },
    panelGroup: new THREE.Group(),
    loaderChar: createLoaderCharacter(dom.loaderChar),
    timers: {},
    animFlags: {
      introLinesAnimEndMs: 0,
      exploreCommitPending: false,
      socialLineAnimated: false,
    },
    events: null,
  };
  createPanels(ctx);
  ctx.events = bindEvents(dom, state, {
    onTogglePaused: () => {
      state.isPaused = !state.isPaused;
      dom.soundBtn.classList.toggle("paused", state.isPaused);
    },
    runIntroPageLineEffects: () => runIntroPageLineEffects(ctx),
    replaySocialLineEffect: () => replaySocialLineEffect(ctx),
  });

  const modal = initModal(ctx);

  dom.exploreBtn.addEventListener("click", () => enterExperience(ctx));
  dom.brand.addEventListener("click", () => returnToExploreIntro(ctx));

  const cleanupLoop = createAnimateLoop(ctx);

  const loadStartMs = performance.now();
  void loadModels(scene, (pct) => { state.modelLoadTargetPct = pct; }, renderer.getPixelRatio())
    .then(({ group, particles }) => {
      // Phase B — runs only after the loader letter has fully dissolved:
      // nothing else (scene canvases, model, intro UI) appears before it.
      const reveal = () => {
        ctx.figureGroup.value = group;
        ctx.particles = particles;
        document.documentElement.classList.remove("experience-loading");
        dom.bgName.classList.add("model-ready");

        // Pre-warm the GPU before the intro wipe-in. Without this, the figure's
        // clay material and the bg-name plane's heavy simplex-noise shader both
        // compile (and upload) on the first frame they render — which is the
        // exact frame the 1.6s wipe-in starts, so the reveal stutters ("giật").
        // Compiling here pays that cost once while everything is still hidden.
        renderer.compile(scene, cam);

        completeExploreReturnToIntroUi(ctx);
      };

      // Phase A — the loading screen exits as a unit: letter fades out while
      // the percentage slides down.
      const beginExit = () => {
        ctx.loaderChar?.startHide();
        dom.modelLoadPct.setAttribute("aria-busy", "false");
        dom.modelLoadPct.textContent = "99";
        dom.modelLoadPct.classList.add("model-load-exit");

        let finished = false;
        const hud = () => {
          if (finished) return;
          finished = true;
          dom.modelLoadPct.classList.remove("model-loading", "model-load-exit");
        };
        dom.modelLoadPct.addEventListener("animationend", hud, { once: true });
        // Safety net only — must fire AFTER the 1.4s slide-down would end.
        // Stripping the classes early while `experience-loading` is still on
        // <html> cancels the animation and pops the number back to visible.
        window.setTimeout(hud, LOADER_CHAR_HIDE_MS + 200);

        ctx.timers.loadReveal = window.setTimeout(reveal, LOADER_CHAR_HIDE_MS);
      };

      // Hold the loading screen open to MIN_LOAD_SCREEN_MS so the wavy loader
      // letter gets its full run even when the models load instantly.
      const waitMs = Math.max(0, MIN_LOAD_SCREEN_MS - (performance.now() - loadStartMs));
      ctx.timers.loadComplete = window.setTimeout(beginExit, waitMs);
    })
    .catch((err) => {
      console.error(err);
      ctx.loaderChar?.startHide();
      // Same sequencing as the success path: reveal the page only after the
      // loader letter has fully dissolved.
      ctx.timers.loadReveal = window.setTimeout(() => {
        document.documentElement.classList.remove("experience-loading");
        dom.modelLoadPct.setAttribute("aria-busy", "false");
        dom.modelLoadPct.classList.remove("model-loading", "model-load-exit");
        scheduleIntroLinesWhenUiVisible(ctx);
      }, LOADER_CHAR_HIDE_MS);
    });

  return () => {
    cleanupLoop();
    modal.teardown();
    ctx.events.teardown();
    window.clearTimeout(ctx.timers.loadComplete);
    window.clearTimeout(ctx.timers.loadReveal);
    ctx.loaderChar?.dispose();
    ctx.loaderChar = null;
    ctx.particles?.dispose();
    ctx.particles = null;
    renderer.dispose();
    bg.renderer.dispose();
  };
}
