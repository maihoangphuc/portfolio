import { RuntimeContext } from "@/lib/experience/runtime/types";
import { C, MONTHS, N } from "@/constants/experience";
import { EXPERIENCE_ENTRY_MS, EXPERIENCE_EXIT_MS, EXPERIENCE_EXIT_REVERSE_MS, EXPERIENCE_EXIT_FORWARD_TRAVEL, MONTH_SWITCH_COOLDOWN_MS, INTRO_PREVIEW_ROTATE_IN_MS, INTRO_PREVIEW_MODEL_ANGLE, INTRO_PREVIEW_BG_YAW } from "@/lib/experience/runtime/world";
import { lerp, smootherstep01 } from "@/lib/experience/runtime/math";
import { drawParticles } from "@/lib/experience/runtime/particles";
import { completeExploreReturnToIntroUi } from "@/lib/experience/runtime/transitions";
import { updatePanels } from "@/lib/experience/runtime/panels";

export function createAnimateLoop(ctx: RuntimeContext) {
  const { dom, state, bg, scene, cam, renderer, raycaster, mouse, pCtx, pState, figureGroup } = ctx;
  let raf = 0;
  // Tracks whether we've claimed bg-name visibility for the outro zone.
  let bgNameInEndZone = false;
  // Drives the inline resize check — the resize event listener is gone; we
  // detect viewport changes here so setSize happens in lockstep with the
  // render below. No throttle, no debounce, no stretching during drag.
  let lastSizeW = 0;
  let lastSizeH = 0;

  function animate() {
    raf = requestAnimationFrame(animate);

    if (innerWidth !== lastSizeW || innerHeight !== lastSizeH) {
      lastSizeW = innerWidth;
      lastSizeH = innerHeight;
      const aspect = innerWidth / innerHeight;
      cam.aspect = aspect;
      cam.updateProjectionMatrix();
      // `false` = skip Three.js's canvas.style.width/height update. CSS
      // `inset: 0` already sizes the canvas — without this, every resize
      // frame Three.js writes inline pixel styles that fight the CSS rule
      // and force a layout/paint pass. That layout pass was the main lag.
      renderer.setSize(innerWidth, innerHeight, false);
      bg.camera.aspect = aspect;
      bg.camera.updateProjectionMatrix();
      bg.renderer.setSize(innerWidth, innerHeight, false);
      dom.particles.width = innerWidth;
      dom.particles.height = innerHeight;
    }

    if (dom.modelLoadPct.classList.contains("model-loading") && !dom.modelLoadPct.classList.contains("model-load-exit")) {
      const nowMs = performance.now();
      const dt = Math.min(0.05, Math.max(1 / 144, (nowMs - state.lastModelLoadUiMs) / 1000));
      state.lastModelLoadUiMs = nowMs;
      const real = Math.min(99, state.modelLoadTargetPct);
      const floorK = 1 - Math.exp(-dt * 6);
      state.modelLoadRealFloor += (real - state.modelLoadRealFloor) * floorK;
      const crawlRemaining = 99 - state.modelLoadCrawlPct;
      const baseCrawlSpeed = state.modelLoadCrawlPct < 50 ? 15 : 8;
      const crawlRate = (crawlRemaining / 99) * baseCrawlSpeed + 0.5;
      state.modelLoadCrawlPct = Math.min(99, state.modelLoadCrawlPct + dt * crawlRate);
      const targetDisplay = Math.max(state.modelLoadRealFloor, state.modelLoadCrawlPct);
      const followK = 1 - Math.exp(-dt * 4);
      state.modelLoadDisplayPct += (targetDisplay - state.modelLoadDisplayPct) * followK;
      state.modelLoadDisplayPct = Math.min(99, Math.max(state.modelLoadDisplayPct, state.lastRenderedLoadPct));
      const shown = Math.floor(state.modelLoadDisplayPct);
      if (shown !== state.lastRenderedLoadPct) {
        state.lastRenderedLoadPct = shown;
        dom.modelLoadPct.textContent = String(shown);
      }
    }

    if (state.isPaused) return;

    let experienceEntryProgress = 1;
    if (state.experienceEntryActive) {
      const elapsed = performance.now() - state.experienceEntryStartMs;
      experienceEntryProgress = Math.min(1, elapsed / EXPERIENCE_ENTRY_MS);
      if (experienceEntryProgress >= 1) {
        state.experienceEntryActive = false;
        state.scrollCurrent = state.entryScrollTo;
      }
    }

    let exitProgress = 0;
    if (state.experienceExitActive) {
      const exitDuration = state.exitReverseMode ? EXPERIENCE_EXIT_REVERSE_MS : EXPERIENCE_EXIT_MS;
      exitProgress = Math.min(1, (performance.now() - state.experienceExitStartMs) / exitDuration);
    }

    drawParticles(dom, pCtx, pState);

    if (state.experienceExitActive) {
      const s0 = state.exitScroll0;
      const u = smootherstep01(exitProgress);
      const prevScrollCurrent = state.scrollCurrent;
      if (state.exitReverseMode) {
        state.scrollCurrent = lerp(s0, 0, u);
      } else {
        const travel = EXPERIENCE_EXIT_FORWARD_TRAVEL;
        state.scrollCurrent = lerp(s0, s0 + travel, u);
      }
      state.scrollTarget = state.scrollCurrent;
      state.scrollVel = state.scrollCurrent - prevScrollCurrent;
      state.scrollVelVis = lerp(state.scrollVelVis, state.scrollVel, 0.4);
    } else {
      state.scrollVel *= 0.82;
      const beforeClampTarget = state.scrollTarget + state.scrollVel;
      // Allow scrolling past the last panel into an "outro" buffer zone
      // where the panels fully rise out and bg-name fades in behind the model.
      const END_BUFFER = 4;
      state.scrollTarget = Math.max(0, Math.min(N - 1 + END_BUFFER, beforeClampTarget));
      if (beforeClampTarget !== state.scrollTarget) {
        state.scrollVel = 0;
        state.scrollVelVis = 0;
      }
      state.scrollCurrent = lerp(state.scrollCurrent, state.scrollTarget, 0.12);
      const visLerp = Math.abs(state.scrollVel) < Math.abs(state.scrollVelVis) ? 0.35 : 0.15;
      state.scrollVelVis = lerp(state.scrollVelVis, state.scrollVel, visLerp);
    }

    const theta = -0.12;
    const radius = 11;
    let camX = Math.sin(theta) * radius, camY = 0.5, camLookAtY = 0.3, camZ = Math.cos(theta) * radius;
    cam.position.set(camX, camY, camZ);
    cam.lookAt(0, camLookAtY, 0);

    const t = Date.now() * 0.001;
    const entryScrollBlend = (!state.introActive && experienceEntryProgress < 1) ? smootherstep01(experienceEntryProgress) : 1;
    let scrollForLayout = state.scrollCurrent;
    if (!state.introActive && experienceEntryProgress < 1 && !state.experienceExitActive) {
      scrollForLayout = lerp(state.entryScrollFrom, state.entryScrollTo, entryScrollBlend);
    }
    state.scrollForLayoutLast = scrollForLayout;
    const sn = scrollForLayout / (N - 1);

    // Outro zone: scroll past the last panel (sn > 1). Panels lift out and
    // bg-name fades in behind the model. Model freezes at its end pose.
    const introActiveOrTransition = state.introActive || state.experienceEntryActive || state.experienceExitActive;
    const END_BUFFER = 4;
    const outroProgress = !introActiveOrTransition
      ? Math.max(0, Math.min(1, (scrollForLayout - (N - 1)) / END_BUFFER))
      : 0;
    const snClamped = Math.min(1, sn);
    if (outroProgress > 0) {
      // Timeline / month / year are hidden the moment we cross into the outro
      // zone — !important to win over the .date-show keyframe animation.
      dom.timeline.style.setProperty("opacity", "0", "important");
      dom.month.style.setProperty("opacity", "0", "important");
      const yearLbl = document.getElementById("year-lbl");
      if (yearLbl) yearLbl.style.setProperty("opacity", "0", "important");
      bgNameInEndZone = true;
      (scene.userData.setOutroReveal as ((p: number) => void) | undefined)?.(outroProgress);
    } else {
      dom.timeline.style.removeProperty("opacity");
      dom.month.style.removeProperty("opacity");
      const yearLbl = document.getElementById("year-lbl");
      if (yearLbl) yearLbl.style.removeProperty("opacity");
      if (bgNameInEndZone) {
        bgNameInEndZone = false;
        (scene.userData.setOutroReveal as ((p: number) => void) | undefined)?.(0);
      }
    }

    if (bg.camera) {
      const TAU = Math.PI * 2;
      let yaw: number;
      if (state.experienceExitActive) {
        const m = smootherstep01(exitProgress);
        const targetYaw = Math.round(state.exitBgYaw0 / TAU) * TAU;
        yaw = lerp(state.exitBgYaw0, targetYaw, m);
      } else if (state.introPreviewActive) {
        const elapsed = performance.now() - state.introPreviewStartMs;
        const u = smootherstep01(Math.min(1, elapsed / INTRO_PREVIEW_ROTATE_IN_MS));
        yaw = u * INTRO_PREVIEW_BG_YAW;
      } else if (!state.introActive && experienceEntryProgress < 1) {
        yaw = lerp(INTRO_PREVIEW_BG_YAW, 0, entryScrollBlend);
      } else {
        // bg shader rotation is much slower than the panel helix — reduce
        // total turns so background drifts gently while scrolling.
        const totalTurns = 1.5;
        const distFromEdge = Math.min(state.scrollCurrent, (N - 1) - state.scrollCurrent);
        const velEdgeFade = Math.min(1, Math.max(0, distFromEdge / 0.6));
        yaw = (state.introActive ? 0 : sn * TAU * totalTurns) + state.scrollVelVis * 0.15 * velEdgeFade;
      }
      const r = 5;
      bg.camera.position.set(Math.sin(yaw) * r, 0, Math.cos(yaw) * r);
      bg.camera.lookAt(0, 0.2, 0);
      state.bgYawLast = yaw;
    }

    if (figureGroup.value) {
      if (state.experienceExitActive) {
        const TAU = Math.PI * 2;
        const m = smootherstep01(exitProgress);
        const targetRot = Math.round(state.exitFigRot0 / TAU) * TAU;
        state.figRotY = lerp(state.exitFigRot0, targetRot, m);
        figureGroup.value.rotation.set(0, state.figRotY, 0);
        state.figPosY = lerp(state.exitFigPosY0, -0.8, m);
        state.figScale = lerp(state.exitFigScale0, 2.6, m);
        figureGroup.value.position.set(0, state.figPosY + Math.sin(t * 0.6) * 0.015, 0);
        figureGroup.value.scale.setScalar(state.figScale);
      } else if (state.introPreviewActive) {
        const elapsed = performance.now() - state.introPreviewStartMs;
        const u = smootherstep01(Math.min(1, elapsed / INTRO_PREVIEW_ROTATE_IN_MS));
        state.figRotY = u * INTRO_PREVIEW_MODEL_ANGLE;
        figureGroup.value.rotation.set(0, state.figRotY, 0);
        state.figPosY = -0.8;
        figureGroup.value.position.set(0, state.figPosY + Math.sin(t * 0.6) * 0.015, 0);
        state.figScale = 2.6;
        figureGroup.value.scale.setScalar(state.figScale);
      } else if (!state.introActive && experienceEntryProgress < 1) {
        const endSn = state.entryScrollTo / (N - 1);
        const baseRotAtEnd = endSn * -Math.PI * 2;
        const spin = (1 - entryScrollBlend) * (INTRO_PREVIEW_MODEL_ANGLE - baseRotAtEnd);
        state.figPosY = -0.8 - endSn * 2.5;
        state.figScale = 2.6 + endSn * 2.0;
        figureGroup.value.rotation.set(0, baseRotAtEnd + spin, 0);
        state.figRotY = baseRotAtEnd;
        figureGroup.value.position.set(0, state.figPosY + Math.sin(t * 0.6) * 0.015, 0);
        figureGroup.value.scale.setScalar(state.figScale);
      } else {
        const modelTurns = 1;
        // Total scroll range is timeline + outro buffer; the model does
        // exactly one turn across that whole range, finishing precisely when
        // bg-name has fully appeared (outroProgress = 1).
        const totalScrollLen = (N - 1) + END_BUFFER;
        const totalScrollT = scrollForLayout / totalScrollLen;
        const modelRotTarget = state.introActive
          ? 0
          : totalScrollT * -Math.PI * 2 * modelTurns;
        const distFromEdge = Math.min(state.scrollCurrent, (N - 1) - state.scrollCurrent);
        const velEdgeFade = Math.min(1, Math.max(0, distFromEdge / 0.6));
        state.figRotY = modelRotTarget + state.scrollVelVis * -0.12 * velEdgeFade;
        figureGroup.value.rotation.set(0, state.figRotY, 0);

        state.figPosY = state.introActive ? -0.8 : -0.8 - snClamped * 2.6;
        figureGroup.value.position.set(0, state.figPosY + Math.sin(t * 0.6) * 0.015, 0);

        state.figScale = state.introActive ? 2.6 : 2.6 + snClamped * 1.2;
        figureGroup.value.scale.setScalar(state.figScale);
      }
    }

    const centerIndex = Math.max(0, Math.min(N - 1, Math.round(scrollForLayout)));

    if (!state.introActive && !state.experienceExitActive) {
      const fi = centerIndex;
      dom.tlProgress.style.width = (Math.max(0, Math.min(1, scrollForLayout / (N - 1))) * 100) + "%";
      const monthIndex = fi % 12;
      const settled = Math.abs(state.scrollTarget - state.scrollCurrent) < 0.02 && Math.abs(state.scrollVel) < 0.0004;
      if (state.lastMonthIndex === null) {
        state.lastMonthIndex = monthIndex; state.lastFiForMonth = fi;
        dom.month.textContent = MONTHS[monthIndex] ?? "Jan";
        if (state.timelineDatesVisible) dom.month.classList.add("date-show");
        state.nextMonthSwitchAt = performance.now();
      } else {
        if (monthIndex !== state.lastMonthIndex) { state.pendingMonthIndex = monthIndex; state.pendingFiForMonth = fi; }
        const now = performance.now();
        if (settled && state.pendingMonthIndex !== null) {
          state.lastMonthIndex = state.pendingMonthIndex; state.lastFiForMonth = state.pendingFiForMonth ?? fi;
          state.pendingMonthIndex = null; state.pendingFiForMonth = null;
          dom.month.textContent = MONTHS[state.lastMonthIndex] ?? "Jan";
          if (state.timelineDatesVisible) dom.month.classList.add("date-show");
        } else if (state.pendingMonthIndex !== null && now >= state.nextMonthSwitchAt) {
          const target = state.pendingMonthIndex!; const targetFi = state.pendingFiForMonth ?? fi;
          state.pendingMonthIndex = null; state.pendingFiForMonth = null;
          state.nextMonthSwitchAt = now + MONTH_SWITCH_COOLDOWN_MS;
          const dir = (state.lastFiForMonth !== null && targetFi < state.lastFiForMonth) ? -1 : 1;
          state.lastFiForMonth = targetFi;
          dom.monthGhost.textContent = MONTHS[state.lastMonthIndex] ?? "Jan";
          dom.monthGhost.classList.remove("leave-left", "leave-right");
          void dom.monthGhost.offsetWidth;
          dom.monthGhost.classList.add(dir > 0 ? "leave-left" : "leave-right");
          dom.month.textContent = MONTHS[target] ?? "Jan";
          if (state.timelineDatesVisible) dom.month.classList.add("date-show");
          dom.month.classList.remove("enter-left", "enter-right");
          void dom.month.offsetWidth;
          dom.month.classList.add(dir > 0 ? "enter-left" : "enter-right");
          state.lastMonthIndex = target;
        }
      }
    }

    if (state.experienceExitActive && exitProgress >= 1) {
      state.experienceExitActive = false; state.introActive = true;
      state.exitReverseMode = false;
      state.figRotY = 0; state.figPosY = -0.8; state.figScale = 2.6;
      // Don't reset figureGroup transforms here — the exit branch above already
      // set them to the final values (position WITH the sin wobble) this frame.
      // Resetting to (0, -0.8, 0) would strip the wobble for one frame, then the
      // next-frame main idle branch re-applies wobble → visible 1-frame jitter.
      state.scrollCurrent = 0; state.scrollTarget = 0; state.scrollVel = 0; state.scrollVelVis = 0;
      dom.tlProgress.style.width = "0%";
      requestAnimationFrame(() => requestAnimationFrame(() => completeExploreReturnToIntroUi(ctx)));
    }

    updatePanels(ctx);
    bg.render();
    renderer.render(scene, cam);
  }

  animate();

  return () => {
    cancelAnimationFrame(raf);
  };
}