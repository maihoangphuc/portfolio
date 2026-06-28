import { Dom } from "@/lib/experience/runtime/types";

/**
 * Background voice track ("/voice.mp3") + the sound-permission gate.
 *
 * Flow (mirrors theyearofgreta.com): once the load screen finishes, the
 * experience is held behind a centered play button + "enable sound" prompt
 * (#sound-permission) with a ring that fills clockwise over AUTO_ENTER_MS. The
 * gate leaves in one of two ways:
 *
 *  - The visitor CLICKS the play button → the gate dismisses; then, once the
 *    intro is in, the footer #sound-btn shows its loading arc for a short beat
 *    (SOUND_START_DELAY_MS) before the mp3 actually starts (the click is the
 *    user gesture browsers require to unlock audio).
 *  - Nobody interacts → when the ring completes the gate AUTO-ADVANCES into the
 *    intro on its own, but stays MUTED. The track only ever starts from an
 *    explicit play press — the gate's button here, or the footer #sound-btn
 *    afterwards. Nothing else (scroll, stray clicks, the auto-advance) plays it.
 */
export type VoiceController = {
  /** Show the gate; `onEnter` runs once the gate is dismissed (intro reveal). */
  beginGate: (onEnter: () => void) => void;
  /** Manual play/pause toggle wired to #sound-btn. */
  toggle: () => void;
  teardown: () => void;
};

// How long the prompt takes to HIDE before we hand off to the intro. The two
// text lines + play button fade out / drift up over ~0.5s (perm-line-out in
// globals.css); this is that plus a small breath, so the prompt is fully gone
// BEFORE the intro starts easing in — hide first, then reveal, never both at
// once. Keep this ≥ the perm-line-out (delay + duration).
const GATE_EXIT_MS = 700;

// How long the gate stays up before auto-advancing into the intro with no
// gesture. MUST match the perm-countdown ring duration in globals.css so the
// ring finishes filling exactly as the gate auto-advances (~4.5s).
const AUTO_ENTER_MS = 4500;

// After the visitor enables sound and the intro is in, an inchworm ("sâu đo")
// arc crawls HALF the #sound-btn border (center-bottom → center-top) before the
// mp3 starts — a quick warm-up beat, not instant playback. Must match the
// inchworm duration of `.sound-starting` in globals.css so playback begins as
// the arc reaches the top.
const SOUND_START_DELAY_MS = 1400;

export function createVoice(dom: Dom): VoiceController {
  const audio = new Audio("/voice.mp3");
  audio.loop = true;
  audio.preload = "auto";
  // Start downloading immediately so the file is buffered before the gate
  // appears (drives the loading ring on the gate button below).
  audio.load();

  // Icon contract (globals.css): no `.paused` class = pause icon (playing),
  // `.paused` = play icon (stopped). Mirror the real element state.
  const syncIcon = () => {
    dom.soundBtn.classList.toggle("paused", audio.paused);
  };
  audio.addEventListener("play", syncIcon);
  audio.addEventListener("pause", syncIcon);

  // Loading ring (globals.css): `.loading` spins an accent arc around the
  // button (icons hidden), like the Greta site. Both the gate's play button and
  // the footer #sound-btn start in `.loading` (set in the JSX) and we CLEAR it
  // the moment the track is READY (`canplaythrough`). On a fast connection the
  // 630KB track finishes during the model-load screen, so the ring is already
  // gone by the time the button appears — expected (snappy); it only lingers on
  // slow links.
  const markReady = () => {
    dom.soundBtn.classList.remove("loading", "sound-starting");
    dom.soundPermissionBtn.classList.remove("loading");
  };
  audio.addEventListener("canplaythrough", markReady);
  audio.addEventListener("playing", markReady);
  audio.addEventListener("error", markReady);

  let gateEntered = false;
  let onGateEnter: (() => void) | null = null;
  let autoEnterTimer: number | undefined;
  let doneTimer: number | undefined;
  let startTimer: number | undefined;

  const play = async () => {
    // A manual press (or anything that starts the track) pre-empts the pending
    // post-gate start delay.
    window.clearTimeout(startTimer);
    try {
      await audio.play();
    } catch {
      // Blocked (e.g. autoplay policy, since this can fire a few seconds after
      // the click) — clear the loading arc and leave the button in its stopped
      // (play-icon) state so the visitor can start it manually.
      markReady();
    }
    syncIcon();
  };

  // Dismiss the gate. `withSound` is true ONLY when the visitor clicked the play
  // button (a user gesture that can unlock audio); the auto-advance passes false
  // so the experience stays muted until an explicit play press.
  function enterFromGate(withSound: boolean) {
    if (gateEntered) return;
    gateEntered = true;
    window.clearTimeout(autoEnterTimer);
    dom.soundPermissionBtn.removeEventListener("click", onPlayClick);

    // Step 1 — HIDE the prompt: `.leaving` slides the play icon out left, draws
    // the countdown ring on to top center, then eases the button + lines away.
    // The intro stays hidden behind the gate while this plays.
    //
    // The ring's CSS keyframe was filling stroke-dashoffset; once we drop
    // `.visible` that animation is gone and the offset would snap back to empty.
    // Pin the LIVE offset inline so the `.leaving` transition (→ 0) carries the
    // leading edge on from exactly where it stood, settling at top center.
    const ringCircle = dom.soundPermissionBtn.querySelector<SVGCircleElement>(
      ".sound-btn-countdown circle",
    );
    // The ring keeps sweeping CLOCKWISE from exactly where its leading edge
    // stood when clicked, on to the next top-center anchor, then settles + fades
    // with the button. The countdown fills clockwise as stroke-dashoffset
    // DECREASES (92.11 → 0), so to carry that same clockwise motion we drop the
    // offset to the next lower multiple of the circumference (the nearest
    // top-center point in the clockwise direction). It runs two laps so the live
    // offset can be negative; flooring handles that, so the direction is
    // clockwise whatever the click timing — no normalisation jump.
    const C = 92.11; // circumference, must match the CSS stroke-dasharray
    let ringTarget = 0;
    if (ringCircle) {
      const o = parseFloat(getComputedStyle(ringCircle).strokeDashoffset) || 0;
      ringTarget = Math.floor(o / C) * C;
      ringCircle.style.strokeDashoffset = `${o}px`; // pin the exact live edge
    }
    dom.soundPermission.classList.remove("visible");
    dom.soundPermission.classList.add("leaving");
    if (ringCircle) {
      // Commit the pinned offset, then ease it to the clockwise anchor so the
      // transition runs from the real position instead of snapping.
      void ringCircle.getBoundingClientRect();
      ringCircle.style.strokeDashoffset = `${ringTarget}px`;
    }

    // Step 2 — only ONCE the prompt has fully hidden do we hand off to the
    // intro: remove the (now-empty) overlay, drop the gate + loading screen, and
    // let the scene/intro ease in gradually (the #c / #bg 0.85s opacity
    // transition + the intro's own entrance). Sequenced, not simultaneous — hide
    // first, THEN transition in, so the reveal feels unhurried.
    doneTimer = window.setTimeout(() => {
      dom.soundPermission.classList.add("done");
      document.documentElement.classList.remove("sound-gate");
      onGateEnter?.();
      onGateEnter = null;

      // Step 3 — if the visitor enabled sound, DON'T start the track yet: keep
      // the #sound-btn's border + icon as-is and just overlay the inchworm
      // "sâu đo" arc (`.sound-starting`) for SOUND_START_DELAY_MS to read as a
      // brief warm-up, THEN begin playback. The `playing` event clears the arc
      // via markReady, so it gives way to the pause icon exactly when sound
      // kicks in. The auto-advance (withSound=false) stays muted, no arc.
      if (withSound) {
        dom.soundBtn.classList.add("sound-starting");
        startTimer = window.setTimeout(() => void play(), SOUND_START_DELAY_MS);
      }
    }, GATE_EXIT_MS);
  }

  // Click the play button → dismiss WITH sound.
  const onPlayClick = () => enterFromGate(true);

  const beginGate = (onEnter: () => void) => {
    onGateEnter = onEnter;
    // Reveal the gate (CSS `.visible` triggers the play-button + line reveal)
    // and hide the footer sound button / social while it's up.
    document.documentElement.classList.add("sound-gate");
    dom.soundPermission.classList.remove("done", "leaving");
    dom.soundPermission.removeAttribute("aria-hidden");
    // Force a reflow so removing `.done` (display:none) takes effect before the
    // reveal animation class is applied.
    void dom.soundPermission.offsetHeight;
    dom.soundPermission.classList.add("visible");

    dom.soundPermissionBtn.addEventListener("click", onPlayClick);

    // Auto-advance into the intro once the ring completes, even if nobody
    // interacts (Greta flow) — MUTED. A play-button click before this fires
    // pre-empts it (enterFromGate clears the timer) and starts the track.
    autoEnterTimer = window.setTimeout(() => enterFromGate(false), AUTO_ENTER_MS);
  };

  const toggle = () => {
    if (audio.paused) void play();
    else audio.pause();
  };

  return {
    beginGate,
    toggle,
    teardown: () => {
      window.clearTimeout(autoEnterTimer);
      window.clearTimeout(doneTimer);
      window.clearTimeout(startTimer);
      dom.soundPermissionBtn.removeEventListener("click", onPlayClick);
      audio.pause();
      audio.removeEventListener("play", syncIcon);
      audio.removeEventListener("pause", syncIcon);
      audio.removeEventListener("canplaythrough", markReady);
      audio.removeEventListener("playing", markReady);
      audio.removeEventListener("error", markReady);
      audio.src = "";
    },
  };
}
