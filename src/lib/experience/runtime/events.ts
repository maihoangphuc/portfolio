import { Dom } from "@/lib/experience/runtime/types";
import { positionSocialLine } from "@/lib/experience/runtime/ui";
import { exitRotationTargetAtLeastOneTurn } from "@/lib/experience/runtime/math";
import { EXPERIENCE_ENTRY_MS, EXPERIENCE_EXIT_MS } from "@/lib/experience/runtime/world";
import { N } from "@/constants/experience";

export function bindEvents(
  dom: Dom,
  state: any, // Use proper state type in index.ts
  callbacks: {
    onTogglePaused: () => void;
    runIntroPageLineEffects: () => void;
    replaySocialLineEffect: () => void;
  }
) {
  const links = Array.from(dom.social.querySelectorAll<HTMLElement>(".soc"));
  const socDefault = dom.social.querySelector<HTMLElement>('.soc[data-key="fb"]');
  let activeSocialLink = socDefault ?? links[0];

  links.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dom.social.classList.remove("social-line-return");
      activeSocialLink = el;
      positionSocialLine(dom, activeSocialLink, 1);
    });
    el.addEventListener("focus", () => {
      dom.social.classList.remove("social-line-return");
      activeSocialLink = el;
      positionSocialLine(dom, activeSocialLink, 0.6);
    });
    el.addEventListener("pointerdown", () => {
      dom.social.classList.remove("social-line-return");
      activeSocialLink = el;
      positionSocialLine(dom, activeSocialLink, 0.6);
    });
  });

  dom.social.addEventListener("mouseleave", () => {
    dom.social.classList.add("social-line-return");
    activeSocialLink = socDefault ?? links[0];
    if (activeSocialLink) positionSocialLine(dom, activeSocialLink, 0.6);
    dom.sline.style.opacity = "0.85";
  });

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!state.scrolled) state.scrolled = true;
    if (state.introActive || state.experienceExitActive || state.experienceEntryActive) return;
    state.scrollVel += e.deltaY * 0.00045;
  };
  window.addEventListener("wheel", onWheel, { passive: false });

  // Two different gestures:
  //   - Hold + slow drag = direct 1:1 mapping to scrollTarget (no inertia)
  //   - Quick flick + release = sets scrollVel for momentum after release
  const PIXELS_PER_PANEL = 750;
  // Flick threshold expressed as fraction of viewport width per ms (matches
  // the original 0.5px/ms tuned for 1920px desktops).
  const FLICK_VW_PER_MS = 0.5 / 1920;
  const FLICK_MOMENTUM_GAIN = 0.01;
  let dragHistory: { dx: number; t: number }[] = [];

  const onPointerDown = (e: PointerEvent) => {
    // Ignore primary mouse-button gating only for mouse; allow touch/pen always
    if (e.pointerType === "mouse" && e.button !== 0) return;
    state.isDragging = true;
    state.lastX = e.clientX;
    dragHistory = [];
    state.scrollVel = 0; // cancel any prior momentum
    if (!state.scrolled) state.scrolled = true;
  };
  const onPointerUp = () => {
    state.isDragging = false;
    // Detect a flick: average px/ms over the last ~120ms.
    if (dragHistory.length >= 2) {
      const last = dragHistory[dragHistory.length - 1];
      const recent = dragHistory.filter((m) => last.t - m.t < 120);
      if (recent.length >= 2) {
        const totalDx = recent.reduce((a, m) => a + m.dx, 0);
        const dt = last.t - recent[0].t;
        if (dt > 0) {
          const vwPerMs = totalDx / dt / innerWidth;
          if (Math.abs(vwPerMs) > FLICK_VW_PER_MS) {
            // Convert back to scrollVel using the same per-viewport scale as drag.
            state.scrollVel = vwPerMs * 1920 * FLICK_MOMENTUM_GAIN;
          }
        }
      }
    }
    dragHistory = [];
  };
  const onPointerMove = (e: PointerEvent) => {
    state.mouseX = (e.clientX / innerWidth) * 2 - 1;
    state.mouseY = -(e.clientY / innerHeight) * 2 + 1;
    if (state.isDragging && !state.introActive && !state.experienceExitActive && !state.experienceEntryActive) {
      const dx = state.lastX - e.clientX;
      state.lastX = e.clientX;
      dragHistory.push({ dx, t: performance.now() });
      if (dragHistory.length > 24) dragHistory.shift();
      // Touch needs a higher gain than mouse (phone swipe ~30% viewport vs
      // mouse drag ~80% desktop), but slower than before so the carousel
      // doesn't fly past panels on a single swipe.
      const touch = e.pointerType !== "mouse";
      const gain = touch ? 0.35 : 1.15;
      state.scrollVel += (dx / innerWidth) * gain;
    }
  };
  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("pointermove", onPointerMove);

  dom.soundBtn.addEventListener("click", callbacks.onTogglePaused);
  dom.soundBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callbacks.onTogglePaused();
    }
  });

  // No resize listener: the animate loop detects viewport changes inline and
  // does setSize in lockstep with rendering. That sync prevents stretching
  // during the drag and any blank-frame race between event and animate.

  return {
    onWheel,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    teardown: () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      dom.soundBtn.removeEventListener("click", callbacks.onTogglePaused);
    },
    getActiveSocialLink: () => activeSocialLink,
    setActiveSocialLink: (val: HTMLElement) => { activeSocialLink = val; }
  };
}
