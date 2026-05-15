import { RuntimeContext } from "@/lib/experience/runtime/types";
import { EXPERIENCE_ENTRY_MS, INTRO_PREVIEW_BG_HIDE_MS, INTRO_PREVIEW_ROTATE_IN_MS, INTRO_PREVIEW_HOLD_MS, DRAG_HINT_FADE_OUT_MS, DRAG_LINE_HEAD_START_MS } from "@/lib/experience/runtime/world";
import { runIntroPageLineEffects, replaySocialLineEffect } from "@/lib/experience/runtime/effects";

export function enterExperience(ctx: RuntimeContext) {
  const { dom, state, animFlags, timers, scene } = ctx;
  if (!state.introActive || animFlags.exploreCommitPending) return;
  animFlags.exploreCommitPending = true;

  dom.introLeft.classList.add("intro-lines-exit");
  dom.introLeft.classList.remove("intro-lines-reveal");
  dom.bgName.classList.add("hidden");
  (scene.userData.setNameIntroShown as ((shown: boolean) => void) | undefined)?.(false);
  if (timers.introLineReveal !== undefined) {
    clearTimeout(timers.introLineReveal);
    timers.introLineReveal = undefined;
  }

  if (timers.dragHintShow !== undefined) {
    clearTimeout(timers.dragHintShow);
    timers.dragHintShow = undefined;
  }
  if (timers.dragHintHide !== undefined) {
    clearTimeout(timers.dragHintHide);
    timers.dragHintHide = undefined;
  }
  if (timers.introRotateStart !== undefined) {
    clearTimeout(timers.introRotateStart);
    timers.introRotateStart = undefined;
  }

  if (timers.timelineReveal !== undefined) {
    clearTimeout(timers.timelineReveal);
    timers.timelineReveal = undefined;
  }

  timers.introRotateStart = window.setTimeout(() => {
    timers.introRotateStart = undefined;
    state.introPreviewActive = true;
    state.introPreviewStartMs = performance.now();
    dom.dragHint.classList.remove("hidden");
    dom.dragHint.classList.add("visible");
    dom.dragHint.style.setProperty("opacity", "1", "important");
  }, INTRO_PREVIEW_BG_HIDE_MS);

  // Lines run alone for a beat, then drag text + timeline join in together.
  timers.timelineReveal = window.setTimeout(() => {
    timers.timelineReveal = undefined;
    dom.timeline.classList.add("date-show");
    replaySocialLineEffect(ctx);
  }, INTRO_PREVIEW_BG_HIDE_MS + DRAG_LINE_HEAD_START_MS);

  const proceed = () => {
    timers.exploreCommit = undefined;
    animFlags.exploreCommitPending = false;
    state.introPreviewActive = false;
    state.introActive = false;
    state.experienceEntryActive = true;
    state.experienceEntryStartMs = performance.now();
    state.entryScrollTo = state.scrollTarget;
    state.entryScrollFrom = state.scrollTarget - 3.5;

    // Lines retract first; only after that fade out the drag text + container.
    dom.dragHint.classList.remove("visible");
    dom.dragHint.classList.add("hidden");
    window.setTimeout(() => {
      dom.dragHint.style.removeProperty("opacity");
    }, 700);

    if (timers.introLineReveal !== undefined) {
      clearTimeout(timers.introLineReveal);
      timers.introLineReveal = undefined;
    }
    if (timers.timelineReveal !== undefined) {
      clearTimeout(timers.timelineReveal);
      timers.timelineReveal = undefined;
    }
    dom.introLeft.classList.remove("intro-lines-reveal", "lines-animated");
    dom.introLeft.classList.add("hidden");
    dom.introRight.classList.add("hidden");
    dom.bgName.classList.add("hidden");
    state.lastMonthIndex = null;
    state.lastFiForMonth = null;
    state.pendingMonthIndex = null;
    state.pendingFiForMonth = null;
    state.nextMonthSwitchAt = 0;
    dom.month.classList.remove("enter-left", "enter-right");
    dom.monthGhost.classList.remove("leave-left", "leave-right");

    if (timers.yearMonthReveal !== undefined) {
      clearTimeout(timers.yearMonthReveal);
    }
    timers.yearMonthReveal = window.setTimeout(() => {
      timers.yearMonthReveal = undefined;
      state.timelineDatesVisible = true;
      document.getElementById("year-lbl")?.classList.add("date-show");
      dom.month.classList.add("date-show");
    }, EXPERIENCE_ENTRY_MS);
  };

  const totalWait = INTRO_PREVIEW_BG_HIDE_MS + INTRO_PREVIEW_ROTATE_IN_MS + INTRO_PREVIEW_HOLD_MS;
  timers.exploreCommit = window.setTimeout(proceed, totalWait);
}

export function returnToExploreIntro(ctx: RuntimeContext) {
  const { dom, state, animFlags, timers, figureGroup } = ctx;
  if (state.experienceExitActive) return;

  const inExploreSequence =
    state.introPreviewActive ||
    animFlags.exploreCommitPending ||
    state.experienceEntryActive;

  if (state.introActive && !inExploreSequence) return;

  if (timers.exploreCommit !== undefined) {
    clearTimeout(timers.exploreCommit);
    timers.exploreCommit = undefined;
  }
  if (timers.dragHintShow !== undefined) {
    clearTimeout(timers.dragHintShow);
    timers.dragHintShow = undefined;
  }
  if (timers.dragHintHide !== undefined) {
    clearTimeout(timers.dragHintHide);
    timers.dragHintHide = undefined;
  }
  if (timers.introRotateStart !== undefined) {
    clearTimeout(timers.introRotateStart);
    timers.introRotateStart = undefined;
  }
  if (timers.yearMonthReveal !== undefined) {
    clearTimeout(timers.yearMonthReveal);
    timers.yearMonthReveal = undefined;
  }
  if (timers.timelineReveal !== undefined) {
    clearTimeout(timers.timelineReveal);
    timers.timelineReveal = undefined;
  }
  if (timers.introLineReveal !== undefined) {
    clearTimeout(timers.introLineReveal);
    timers.introLineReveal = undefined;
  }
  if (timers.entryStart !== undefined) {
    clearTimeout(timers.entryStart);
    timers.entryStart = undefined;
  }

  state.introPreviewActive = false;
  animFlags.exploreCommitPending = false;
  state.timelineDatesVisible = false;

  // Drag hint: only trigger the exit animation if it actually became visible.
  // If user clicks brand before introRotateStart fires (within INTRO_PREVIEW_BG_HIDE_MS),
  // .visible was never added — adding .hidden here would still kick the children's
  // exit animations (drag-line-hide jumps to scaleX(1), char-exit holds opacity 1 during
  // its 0.7s delay), causing a brief flash even though we never wanted it shown.
  if (dom.dragHint.classList.contains("visible")) {
    dom.dragHint.classList.remove("visible");
    dom.dragHint.classList.add("hidden");
    dom.dragHint.style.setProperty("opacity", "0", "important");
  } else {
    dom.dragHint.classList.remove("hidden");
    dom.dragHint.style.removeProperty("opacity");
  }
  dom.timeline.classList.remove("date-show");
  document.getElementById("year-lbl")?.classList.remove("date-show");
  dom.month.classList.remove("date-show");
  state.lastMonthIndex = null;
  state.lastFiForMonth = null;
  state.pendingMonthIndex = null;
  state.pendingFiForMonth = null;
  state.nextMonthSwitchAt = 0;
  dom.month.classList.remove("enter-left", "enter-right");
  dom.monthGhost.classList.remove("leave-left", "leave-right");

  // Reverse mode only when in preview/hold (no panels visible yet);
  // during entry (panels rising) and stable, use the forward-scroll exit
  const inPreviewPhase = state.introActive && inExploreSequence;

  // Always trigger smooth exit animation — interrupt any in-flight explore phase.
  // Use scrollForLayoutLast (the visually-rendered scroll) so the exit picks up
  // exactly where the panels are currently positioned — avoids any jump if user
  // interrupts mid-entry while scrollCurrent and the entry-blended scroll diverge.
  state.exitScroll0 = state.scrollForLayoutLast;
  state.exitFigRot0 = figureGroup.value ? figureGroup.value.rotation.y : state.figRotY;
  state.exitWasEntryMidSpin = false;
  state.exitReverseMode = inPreviewPhase;
  const TAU = Math.PI * 2;
  state.exitFigRot1 = Math.round(state.exitFigRot0 / TAU) * TAU;
  state.exitFigPosY0 = state.figPosY;
  state.exitFigScale0 = state.figScale;
  state.exitBgYaw0 = state.bgYawLast;
  state.experienceExitStartMs = performance.now();
  state.experienceExitActive = true;
  state.introActive = false;
  state.experienceEntryActive = false;
  state.scrolled = false;
  state.scrollVel = 0;
  state.scrollVelVis = 0;
  state.scrollCurrent = state.scrollForLayoutLast;
  state.scrollTarget = state.scrollForLayoutLast;
}

export function completeExploreReturnToIntroUi(ctx: RuntimeContext) {
  const { dom, scene } = ctx;
  // Only strip the reveal classes if we're returning from an exit-from-experience
  // cycle (signalled by the `intro-lines-exit` class set in enterExperience).
  // On initial mount the reveal classes are already set via JSX so the text
  // can fade in before models finish loading — wiping them here would force
  // a re-animation and re-trigger the LCP cost.
  if (dom.introLeft.classList.contains("intro-lines-exit")) {
    dom.introLeft.classList.remove("intro-lines-reveal", "lines-animated", "intro-lines-exit");
    void dom.introLeft.offsetHeight;
  }
  dom.introLeft.classList.remove("hidden");
  dom.introRight.classList.remove("hidden");
  dom.bgName.classList.remove("hidden");
  (scene.userData.setNameIntroShown as ((shown: boolean) => void) | undefined)?.(true);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      runIntroPageLineEffects(ctx);
    });
  });
}

export function scheduleIntroLinesWhenUiVisible(ctx: RuntimeContext) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      runIntroPageLineEffects(ctx);
    });
  });
}
