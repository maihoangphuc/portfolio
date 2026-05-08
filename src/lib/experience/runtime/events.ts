import { Dom } from "@/lib/experience/runtime/types";
import { positionSocialLine } from "@/lib/experience/runtime/ui";
import { exitRotationTargetAtLeastOneTurn } from "@/lib/experience/runtime/math";
import { EXPERIENCE_ENTRY_MS, EXPERIENCE_EXIT_MS } from "@/lib/experience/runtime/world";
import { N } from "@/constants/experience";

export function bindEvents(
  dom: Dom,
  state: any, // Use proper state type in index.ts
  callbacks: {
    onResize: () => void;
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
  const FLICK_PX_PER_MS = 0.5;
  const FLICK_MOMENTUM_GAIN = 0.01;
  let dragHistory: { dx: number; t: number }[] = [];

  const onMouseDown = (e: MouseEvent) => {
    state.isDragging = true;
    state.lastX = e.clientX;
    dragHistory = [];
    state.scrollVel = 0; // cancel any prior momentum
    if (!state.scrolled) state.scrolled = true;
  };
  const onMouseUp = () => {
    state.isDragging = false;
    // Detect a flick: average px/ms over the last ~120ms.
    if (dragHistory.length >= 2) {
      const last = dragHistory[dragHistory.length - 1];
      const recent = dragHistory.filter((m) => last.t - m.t < 120);
      if (recent.length >= 2) {
        const totalDx = recent.reduce((a, m) => a + m.dx, 0);
        const dt = last.t - recent[0].t;
        if (dt > 0) {
          const pxPerMs = totalDx / dt;
          if (Math.abs(pxPerMs) > FLICK_PX_PER_MS) {
            state.scrollVel = pxPerMs * FLICK_MOMENTUM_GAIN;
          }
        }
      }
    }
    dragHistory = [];
  };
  const onMouseMove = (e: MouseEvent) => {
    state.mouseX = (e.clientX / innerWidth) * 2 - 1;
    state.mouseY = -(e.clientY / innerHeight) * 2 + 1;
    if (state.isDragging && !state.introActive && !state.experienceExitActive && !state.experienceEntryActive) {
      const dx = state.lastX - e.clientX;
      state.lastX = e.clientX;
      dragHistory.push({ dx, t: performance.now() });
      if (dragHistory.length > 24) dragHistory.shift();
      // Add to scrollVel so motion is smooth (no per-event jitter) and the
      // panel stretch/shear shader effect also tracks drag speed naturally.
      state.scrollVel += dx * 0.0006;
    }
  };
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);

  dom.soundBtn.addEventListener("click", callbacks.onTogglePaused);
  dom.soundBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callbacks.onTogglePaused();
    }
  });

  window.addEventListener("resize", callbacks.onResize);

  return {
    onWheel,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    teardown: () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", callbacks.onResize);
      dom.soundBtn.removeEventListener("click", callbacks.onTogglePaused);
    },
    getActiveSocialLink: () => activeSocialLink,
    setActiveSocialLink: (val: HTMLElement) => { activeSocialLink = val; }
  };
}
