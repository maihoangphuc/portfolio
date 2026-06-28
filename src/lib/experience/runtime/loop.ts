import { RuntimeContext } from "@/lib/experience/runtime/types";
import { MONTHS, N } from "@/constants/experience";
import { PANELS } from "@/constants/panels";
import { EXPERIENCE_ENTRY_MS, EXPERIENCE_EXIT_MS, EXPERIENCE_EXIT_REVERSE_MS, EXPERIENCE_EXIT_FORWARD_TRAVEL, MONTH_SWITCH_COOLDOWN_MS, INTRO_PREVIEW_ROTATE_IN_MS, INTRO_PREVIEW_MODEL_ANGLE, INTRO_PREVIEW_BG_YAW, LOAD_PCT_RAMP_MS } from "@/lib/experience/runtime/world";
import { lerp, smootherstep01 } from "@/lib/experience/runtime/math";
import { completeExploreReturnToIntroUi } from "@/lib/experience/runtime/transitions";
import { updatePanels } from "@/lib/experience/runtime/panels";

// Two bottom labels:
//  - small top label (#year-lbl)  = this panel's month + year (e.g. "Jul 2025")
//  - big bottom label (#month-lbl) = the CV section, with the slide swap.
// Canonical section names (must match PANELS[].label) for indexing, and the
// abbreviated forms actually shown in the big label.
const SECTION_LABELS = ["Objective", "Experience", "Education", "Skills"];
const SECTION_ABBR = ["Obj", "Exp", "Edu", "Skl"];

// How long the intro-right reverse runs before the block is fully hidden.
// Mirrors #intro-left's exit: the line collapses to the left (0.6s) and the
// text fades (0.8s), while the CV button's chars drop out staggered — the last
// "Download CV" char ends at ~0.3s delay + 0.6s = ~0.9s, the latest event.
const INTRO_RIGHT_EXIT_MS = 950;

// First panel of the Skills section — once the scroll reaches it, the timeline
// and the month/year scrubber hide (Skills isn't tied to the date axis).
const _skillsIdx = PANELS.findIndex((p) => p.label === "Skills");
const SKILLS_START_INDEX = _skillsIdx >= 0 ? _skillsIdx : Infinity;

// Scroll position where the date axis (timeline + month/year scrubber) hides —
// halfway between the last dated panel and the first Skills panel. The `inSkills`
// crossing below must use the same value.
const DATE_HIDE_AT = Number.isFinite(SKILLS_START_INDEX)
  ? SKILLS_START_INDEX - 0.5
  : N - 1;

// The timeline bar fills 0→100% across scroll 0→DATE_HIDE_AT. (The month/year
// scrubber instead sweeps each panel's own date range — see monthIndexForScroll
// — so it naturally rests on Aug 2017 from the 2017 panel until the axis hides.)
const DATE_END_INDEX = DATE_HIDE_AT;

// Section index for the centered panel — keys the big label's slide swap, so
// panels in the same section don't re-trigger the animation.
function sectionIndexForPanel(fi: number): number {
  const len = PANELS.length;
  const label = PANELS[((fi % len) + len) % len].label;
  const idx = SECTION_LABELS.indexOf(label);
  return idx >= 0 ? idx : 0;
}

function sectionLabel(sectionIndex: number): string {
  const n = SECTION_ABBR.length;
  return SECTION_ABBR[((sectionIndex % n) + n) % n];
}

// Small top label = a date scrubber whose value stays inside the date range of
// the centered panel, never bleeding into a neighbour's era — so the date and
// the section label always agree with the panel you're looking at.
//
// Each dated panel owns a [start, end] month range. start = month/year; end =
// endMonth/endYear, or "now" for the newest panel (Present), or the previous
// panel's start as a contiguity fallback. The scrubber sweeps end→start across
// the panel's scroll slot [i-0.5, i+0.5] (newer edge shows the recent end, older
// edge the start), then steps to the next panel's range at the midpoint.
const monthIndexOf = (m: string | undefined) =>
  m ? Math.max(0, (MONTHS as readonly string[]).indexOf(m)) : 0;
const DATED_PANELS = PANELS.slice(
  0,
  Number.isFinite(SKILLS_START_INDEX) ? SKILLS_START_INDEX : PANELS.length,
);
const START_ANCHORS = DATED_PANELS.map((p) => parseInt(p.year, 10) * 12 + monthIndexOf(p.month));
const NOW_MONTHS = (() => {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
})();
const END_ANCHORS = DATED_PANELS.map((p, i) =>
  p.endYear && p.endMonth
    ? parseInt(p.endYear, 10) * 12 + monthIndexOf(p.endMonth)
    : i === 0
      ? NOW_MONTHS
      : START_ANCHORS[i - 1],
);

// Month-index (year*12 + month) shown by the date scrubber at a scroll position.
function monthIndexForScroll(s: number): number {
  const last = START_ANCHORS.length - 1;
  const i = Math.max(0, Math.min(last, Math.round(s)));
  // frac: 0 at the newer edge of panel i's slot → END (recent), 1 at the older
  // edge → START. The newest panel has no left half (scroll can't go below 0),
  // so its slot is [0, 0.5]: scroll 0 sits exactly on END = now (Present).
  const frac = i === 0
    ? Math.max(0, Math.min(1, s / 0.5))
    : Math.max(0, Math.min(1, s - i + 0.5));
  return Math.round(END_ANCHORS[i] + (START_ANCHORS[i] - END_ANCHORS[i]) * frac);
}

function dateLabelFromMonthIndex(cur: number): string {
  const month = MONTHS[((cur % 12) + 12) % 12];
  const year = Math.floor(cur / 12);
  return `${month} ${year}`;
}

export function createAnimateLoop(ctx: RuntimeContext) {
  const { dom, state, bg, scene, cam, renderer, raycaster, mouse, figureGroup } = ctx;
  let raf = 0;
  // Tracks whether we've claimed bg-name visibility for the outro zone.
  let bgNameInEndZone = false;
  // Last small-label text written (month + year for the centered panel).
  let lastDateText = "";
  // Whether each bottom label is currently slid out of view (edge-triggers the
  // slide-down/up so a crossing fires exactly one animation).
  let yearHidden = false;
  let monthHidden = false;
  // Whether the right-side outro statement block is currently revealed.
  let introRightShown = false;
  // Pending removal of the `outro-exit` class once the reverse animation ends.
  let introRightExitTimer: number | undefined;

  // Once a reappear slide finishes, drop `lbl-up` so the section swap animations
  // (and the date-show entrance) aren't permanently overridden by its !important.
  const onMonthAnimEnd = (e: AnimationEvent) => {
    if (e.animationName === "month-lbl-up") dom.month.classList.remove("lbl-up");
  };
  const onYearAnimEnd = (e: AnimationEvent) => {
    if (e.animationName === "year-lbl-up") dom.yearLbl.classList.remove("lbl-up");
  };
  dom.month.addEventListener("animationend", onMonthAnimEnd);
  dom.yearLbl.addEventListener("animationend", onYearAnimEnd);

  // intro-right line settles to a fixed 15px dash via scaleX(15/trackWidth).
  // Recompute on reveal AND on resize so the dash stays put (the rule is
  // 100%-wide, so a fixed scale would otherwise stretch as the viewport changes).
  const setIntroRightRuleScale = () => {
    const track = dom.introRight.querySelector<HTMLElement>("#intro-rule-right-track");
    if (!track) return;
    const w = track.clientWidth;
    track.style.setProperty("--intro-rule-final-scale", w > 0 ? String(15 / w) : "0.04");
  };
  // Resize handling: every frame the viewport changes we update the camera
  // aspect AND reallocate the canvas framebuffers in lockstep. Reallocating
  // the GPU buffers immediately keeps the render at native resolution during
  // the drag — deferring setSize would leave the canvas at its old resolution
  // while CSS `width:100%` stretches it, which reads as blur until the resize
  // settles. `false` skips Three.js's canvas.style.width/height write: CSS
  // `inset: 0` already sizes the canvas, and the inline styles would fight the
  // CSS rule and force an extra layout/paint each frame.
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
      bg.camera.aspect = aspect;
      bg.camera.updateProjectionMatrix();
      renderer.setSize(lastSizeW, lastSizeH, false);
      bg.renderer.setSize(lastSizeW, lastSizeH, false);
      // Keep the intro-right dash a fixed length across the resize.
      if (introRightShown) setIntroRightRuleScale();
    }

    // Wavy loader letter: renders to its own canvas while the load HUD is up,
    // then is torn down for good once its fade-out completes.
    if (ctx.loaderChar && !ctx.loaderChar.update()) {
      ctx.loaderChar.dispose();
      ctx.loaderChar = null;
    }

    if (dom.modelLoadPct.classList.contains("model-loading") && !dom.modelLoadPct.classList.contains("model-load-exit")) {
      const nowMs = performance.now();
      if (state.modelLoadStartMs === 0) state.modelLoadStartMs = nowMs;
      const dt = Math.min(0.05, Math.max(1 / 144, (nowMs - state.lastModelLoadUiMs) / 1000));
      state.lastModelLoadUiMs = nowMs;
      const real = Math.min(99, state.modelLoadTargetPct);
      const floorK = 1 - Math.exp(-dt * 6);
      state.modelLoadRealFloor += (real - state.modelLoadRealFloor) * floorK;
      const crawlRemaining = 99 - state.modelLoadCrawlPct;
      const baseCrawlSpeed = state.modelLoadCrawlPct < 50 ? 15 : 8;
      const crawlRate = (crawlRemaining / 99) * baseCrawlSpeed + 0.5;
      state.modelLoadCrawlPct = Math.min(99, state.modelLoadCrawlPct + dt * crawlRate);
      // Time-paced ceiling: even if the models arrive instantly (cache), the
      // number walks to 99 across the minimum loading-screen window instead
      // of jumping there and idling.
      const timeCap = (99 * (nowMs - state.modelLoadStartMs)) / LOAD_PCT_RAMP_MS;
      const targetDisplay = Math.min(Math.max(state.modelLoadRealFloor, state.modelLoadCrawlPct), timeCap);
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

    // Dust points around the figure — shader does the motion, the loop just
    // advances the orbit/rise clocks.
    ctx.particles?.update();

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
    const camX = Math.sin(theta) * radius, camY = 0.5, camLookAtY = 0.3, camZ = Math.cos(theta) * radius;
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

    // Bottom labels slide DOWN to hide at the end and slide UP to reappear when
    // scrolling back. month/year hides on entering Skills; the section hides in
    // the outro. Edge-triggered so each crossing fires exactly one slide.
    const inSkills = !introActiveOrTransition && scrollForLayout > DATE_HIDE_AT;
    const dateHide = inSkills || outroProgress > 0; // timeline + month/year
    const sectionHide = outroProgress > 0; // big section label

    // Right-side outro statement: reveal when the section label is gone (outro),
    // hide when scrolling back. Edge-triggered so the reveal replays each time.
    const showIntroRight = !introActiveOrTransition && outroProgress > 0;
    if (showIntroRight !== introRightShown) {
      introRightShown = showIntroRight;
      if (showIntroRight) {
        // Entering the outro: cancel any in-flight exit and replay the reveal.
        // Match intro-left: the line settles to a fixed 15px dash, so scale the
        // 100%-wide rule by 15/trackWidth (see runIntroPageLineEffects).
        if (introRightExitTimer !== undefined) {
          clearTimeout(introRightExitTimer);
          introRightExitTimer = undefined;
        }
        setIntroRightRuleScale();
        dom.introRight.classList.remove("outro-exit");
        dom.introRight.classList.add("outro-show");
      } else {
        // Scrolling back up: retract the line + fade the text (the reverse of
        // the reveal) BEFORE hiding, instead of snapping to opacity 0.
        dom.introRight.classList.remove("outro-show");
        dom.introRight.classList.add("outro-exit");
        if (introRightExitTimer !== undefined) clearTimeout(introRightExitTimer);
        introRightExitTimer = window.setTimeout(() => {
          introRightExitTimer = undefined;
          dom.introRight.classList.remove("outro-exit");
        }, INTRO_RIGHT_EXIT_MS);
      }
    }

    if (introActiveOrTransition) {
      // Outside the scroll experience — date-show (enter/exit) governs; clear
      // the scrub state so it doesn't fight the enter/exit transition.
      dom.timeline.style.removeProperty("opacity");
      dom.yearLbl.classList.remove("lbl-up", "lbl-down");
      dom.month.classList.remove("lbl-up", "lbl-down");
      yearHidden = false;
      monthHidden = false;
    } else {
      // Timeline: plain fade.
      if (dateHide) dom.timeline.style.setProperty("opacity", "0", "important");
      else dom.timeline.style.removeProperty("opacity");

      if (dateHide !== yearHidden) {
        yearHidden = dateHide;
        dom.yearLbl.classList.remove(dateHide ? "lbl-up" : "lbl-down");
        dom.yearLbl.classList.add(dateHide ? "lbl-down" : "lbl-up");
      }
      if (sectionHide !== monthHidden) {
        monthHidden = sectionHide;
        dom.month.classList.remove(sectionHide ? "lbl-up" : "lbl-down");
        dom.month.classList.add(sectionHide ? "lbl-down" : "lbl-up");
      }
    }

    // Outro reveal (bg-name) — independent of the label visibility above.
    if (outroProgress > 0) {
      bgNameInEndZone = true;
      (scene.userData.setOutroReveal as ((p: number) => void) | undefined)?.(outroProgress);
    } else if (bgNameInEndZone) {
      bgNameInEndZone = false;
      (scene.userData.setOutroReveal as ((p: number) => void) | undefined)?.(0);
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
        const m = smootherstep01(exitProgress);
        // Target rotation is decided in returnToExploreIntro: nearest full turn
        // for a normal exit (minimal spin), or a full unwind to 0 when leaving
        // the outro so the figure rotates all the way back to its intro pose.
        state.figRotY = lerp(state.exitFigRot0, state.exitFigRot1, m);
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
      // Bar fills across the dated panels only (Now → 2017), not the Skills tail.
      const dateProgress = scrollForLayout / DATE_END_INDEX;
      dom.tlProgress.style.width = (Math.max(0, Math.min(1, dateProgress)) * 100) + "%";

      // Small top label: the centered panel's real month + year, interpolated
      // smoothly between adjacent dated panels as you scroll.
      const cur = monthIndexForScroll(scrollForLayout);
      const dateText = dateLabelFromMonthIndex(cur);
      if (dateText !== lastDateText) {
        lastDateText = dateText;
        dom.yearLbl.textContent = dateText;
      }

      // Big bottom label: the CV section, with the slide swap (keyed by section).
      // Keyed by the centered panel — and since the date scrubber stays inside
      // that panel's range, the date above always agrees with this section.
      const labelIndex = sectionIndexForPanel(fi);
      const settled = Math.abs(state.scrollTarget - state.scrollCurrent) < 0.02 && Math.abs(state.scrollVel) < 0.0004;
      if (state.lastMonthIndex === null) {
        state.lastMonthIndex = labelIndex; state.lastFiForMonth = fi;
        dom.month.textContent = sectionLabel(labelIndex);
        if (state.timelineDatesVisible) dom.month.classList.add("date-show");
        state.nextMonthSwitchAt = performance.now();
      } else {
        if (labelIndex !== state.lastMonthIndex) { state.pendingMonthIndex = labelIndex; state.pendingFiForMonth = fi; }
        const now = performance.now();
        if (settled && state.pendingMonthIndex !== null) {
          state.lastMonthIndex = state.pendingMonthIndex; state.lastFiForMonth = state.pendingFiForMonth ?? fi;
          state.pendingMonthIndex = null; state.pendingFiForMonth = null;
          dom.month.textContent = sectionLabel(state.lastMonthIndex);
          if (state.timelineDatesVisible) dom.month.classList.add("date-show");
        } else if (state.pendingMonthIndex !== null && now >= state.nextMonthSwitchAt) {
          const target = state.pendingMonthIndex!; const targetFi = state.pendingFiForMonth ?? fi;
          state.pendingMonthIndex = null; state.pendingFiForMonth = null;
          state.nextMonthSwitchAt = now + MONTH_SWITCH_COOLDOWN_MS;
          const dir = (state.lastFiForMonth !== null && targetFi < state.lastFiForMonth) ? -1 : 1;
          state.lastFiForMonth = targetFi;
          dom.monthGhost.textContent = sectionLabel(state.lastMonthIndex);
          dom.monthGhost.classList.remove("leave-left", "leave-right");
          void dom.monthGhost.offsetWidth;
          dom.monthGhost.classList.add(dir > 0 ? "leave-left" : "leave-right");
          dom.month.textContent = sectionLabel(target);
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
    if (introRightExitTimer !== undefined) clearTimeout(introRightExitTimer);
    dom.month.removeEventListener("animationend", onMonthAnimEnd);
    dom.yearLbl.removeEventListener("animationend", onYearAnimEnd);
  };
}