import { RuntimeContext } from "@/lib/experience/runtime/types";
import { EXPERIENCE_ENTRY_MS, INTRO_PREVIEW_BG_HIDE_MS, INTRO_PREVIEW_ROTATE_IN_MS, INTRO_PREVIEW_HOLD_MS, DRAG_HINT_FADE_OUT_MS, DRAG_CHARS_REVEAL_MS } from "@/lib/experience/runtime/world";
import { runIntroPageLineEffects, replaySocialLineEffect } from "@/lib/experience/runtime/effects";

export function enterExperience(ctx: RuntimeContext) {
  const { dom, state, animFlags, timers } = ctx;
  if (!state.introActive || animFlags.exploreCommitPending) return;
  animFlags.exploreCommitPending = true;

  dom.introLeft.classList.add("intro-lines-exit");
  dom.introLeft.classList.remove("intro-lines-reveal");
  dom.bgName.classList.add("hidden");
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

  timers.introRotateStart = window.setTimeout(() => {
    timers.introRotateStart = undefined;
    state.introPreviewActive = true;
    state.introPreviewStartMs = performance.now();
    dom.dragHint.classList.remove("hidden");
    dom.dragHint.classList.add("visible");
    dom.dragHint.style.setProperty("opacity", "1", "important");
  }, INTRO_PREVIEW_BG_HIDE_MS);

  if (timers.timelineReveal !== undefined) {
    clearTimeout(timers.timelineReveal);
    timers.timelineReveal = undefined;
  }
  timers.timelineReveal = window.setTimeout(() => {
    timers.timelineReveal = undefined;
    dom.timeline.classList.add("date-show");
    replaySocialLineEffect(ctx);
  }, INTRO_PREVIEW_BG_HIDE_MS + DRAG_CHARS_REVEAL_MS);

  const proceed = () => {
    timers.exploreCommit = undefined;
    animFlags.exploreCommitPending = false;
    state.introPreviewActive = false;
    state.introActive = false;
    state.experienceEntryActive = true;
    state.experienceEntryStartMs = performance.now();
    state.entryScrollTo = state.scrollTarget;
    state.entryScrollFrom = state.scrollTarget - 3.5;
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

    if (timers.dragHintHide !== undefined) {
      clearTimeout(timers.dragHintHide);
    }
    const dragHideStartMs = Math.max(0, EXPERIENCE_ENTRY_MS - DRAG_HINT_FADE_OUT_MS);
    timers.dragHintHide = window.setTimeout(() => {
      timers.dragHintHide = undefined;
      dom.dragHint.classList.remove("visible");
      dom.dragHint.classList.add("hidden");
      dom.dragHint.style.setProperty("opacity", "0", "important");
    }, dragHideStartMs);

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
  if (state.introActive || state.experienceExitActive) return;
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
  state.introPreviewActive = false;
  dom.dragHint.classList.remove("visible");
  dom.dragHint.classList.add("hidden");
  dom.dragHint.style.setProperty("opacity", "0", "important");
  animFlags.exploreCommitPending = false;
  if (timers.timelineReveal !== undefined) {
    clearTimeout(timers.timelineReveal);
    timers.timelineReveal = undefined;
  }
  state.timelineDatesVisible = false;
  if (timers.introLineReveal !== undefined) {
    clearTimeout(timers.introLineReveal);
    timers.introLineReveal = undefined;
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

  state.exitScroll0 = state.experienceEntryActive ? state.scrollForLayoutLast : state.scrollCurrent;
  state.exitFigRot0 = figureGroup.value ? figureGroup.value.rotation.y : state.figRotY;
  state.exitWasEntryMidSpin = false;
  const TAU = Math.PI * 2;
  state.exitFigRot1 = Math.round(state.exitFigRot0 / TAU) * TAU;
  state.exitFigPosY0 = state.figPosY;
  state.exitFigScale0 = state.figScale;
  state.exitBgYaw0 = state.bgYawLast;
  state.experienceExitStartMs = performance.now();
  state.experienceExitActive = true;
  state.experienceEntryActive = false;
  state.scrolled = false;
  state.scrollVel = 0;
  state.scrollVelVis = 0;
  state.scrollTarget = 0;
}

export function completeExploreReturnToIntroUi(ctx: RuntimeContext) {
  const { dom } = ctx;
  dom.introLeft.classList.remove("intro-lines-reveal", "lines-animated", "intro-lines-exit");
  void dom.introLeft.offsetHeight;
  dom.introLeft.classList.remove("hidden");
  dom.introRight.classList.remove("hidden");
  dom.bgName.classList.remove("hidden");
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
