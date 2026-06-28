import { Dom } from "@/lib/experience/runtime/types";

/**
 * Background audio (looping voice "/voice_proc.mp3" + continuous music
 * "/bgm.mp3", with real-time ducking) + the sound-permission gate.
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
// once. Keep this ≥ the slowest exit animation (ring sweep ~1s + the button's
// 0.92s hold + 0.24s fade); the ring sweep is the long pole now.
const GATE_EXIT_MS = 1250;

// How long the gate stays up before auto-advancing into the intro with no
// gesture. MUST match the perm-countdown ring duration in globals.css so the
// ring finishes filling exactly as the gate auto-advances (~4.5s).
const AUTO_ENTER_MS = 4500;

// The countdown ring's LAP 1 — the fast initial draw (0→20% of perm-countdown in
// globals.css) that fills the ring once. The play button stays click-LOCKED
// until this lap completes, so pressing it can only dismiss the gate AFTER the
// ring has drawn fully round once. Must match the 20% split of perm-countdown.
const RING_LAP1_MS = AUTO_ENTER_MS * 0.2;

// After the visitor enables sound and the intro is in, an inchworm ("sâu đo")
// arc crawls HALF the #sound-btn border (center-bottom → center-top) before the
// mp3 starts — a quick warm-up beat, not instant playback. Must match the
// inchworm duration of `.sound-starting` in globals.css so playback begins as
// the arc reaches the top.
const SOUND_START_DELAY_MS = 1800;

export function createVoice(dom: Dom): VoiceController {
  // Two INDEPENDENT tracks: the looping VOICE (widened pauses, no music baked
  // in) and a CONTINUOUS background MUSIC bed that loops on its own cycle — so
  // the music plays on forever and never restarts in step with the voice loop.
  const audio = new Audio("/voice_proc.mp3"); // the looping voice
  audio.loop = true;
  audio.preload = "auto";
  // Start downloading immediately so the file is buffered before the gate
  // appears (drives the loading ring on the gate button below).
  audio.load();

  const music = new Audio("/bgm.mp3"); // the continuous music bed
  music.loop = true;
  music.preload = "auto";
  music.load();

  // Real-time ducking via Web Audio (built lazily on first play — needs a user
  // gesture). The music's gain is driven from the voice's live level: it dips
  // under speech and swells back up in the voice's pauses. If Web Audio isn't
  // available we fall back to a fixed low music volume (no dynamic ducking).
  const BASE_VOL = 0.4; // music level in the voice's pauses
  const DUCK_VOL = 0.12; // music level under speech
  let ctx: AudioContext | null = null;
  let musicGain: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let duckData: Float32Array<ArrayBuffer> | null = null;
  let duckRaf = 0;
  let graphBuilt = false;

  const buildGraph = () => {
    if (graphBuilt) return;
    graphBuilt = true;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
      const vSrc = ctx.createMediaElementSource(audio);
      const mSrc = ctx.createMediaElementSource(music);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0; // fade up from silence when playback starts
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      duckData = new Float32Array(analyser.fftSize);
      vSrc.connect(ctx.destination); // voice -> speakers (full)
      vSrc.connect(analyser); //         voice -> ducking key
      mSrc.connect(musicGain).connect(ctx.destination); // music -> gain -> out
    } catch {
      ctx = null;
      musicGain = null;
      analyser = null;
      music.volume = BASE_VOL; // graceful fallback: steady low music
    }
  };

  // Per-frame envelope follower: measure the voice's RMS and steer the music
  // gain toward DUCK_VOL while speaking / BASE_VOL in the gaps. Fast attack
  // (duck down quickly), gentler release (let it breathe back up).
  const duckTick = () => {
    if (ctx && musicGain && analyser && duckData) {
      analyser.getFloatTimeDomainData(duckData);
      let sum = 0;
      for (let i = 0; i < duckData.length; i++) sum += duckData[i] * duckData[i];
      const rms = Math.sqrt(sum / duckData.length);
      const speaking = rms > 0.015;
      musicGain.gain.setTargetAtTime(
        speaking ? DUCK_VOL : BASE_VOL,
        ctx.currentTime,
        speaking ? 0.05 : 0.28,
      );
    }
    duckRaf = requestAnimationFrame(duckTick);
  };
  const startDuck = () => {
    if (!duckRaf) duckTick();
  };
  const stopDuck = () => {
    if (duckRaf) {
      cancelAnimationFrame(duckRaf);
      duckRaf = 0;
    }
  };

  // Icon contract (globals.css): no `.paused` class = pause icon (playing),
  // `.paused` = play icon (stopped). Mirror the MUSIC element — it represents
  // "sound is on", and it starts before the voice (which leads in a few seconds
  // later), so the button must read as playing during that lead.
  const syncIcon = () => {
    dom.soundBtn.classList.toggle("paused", music.paused);
  };
  music.addEventListener("play", syncIcon);
  music.addEventListener("pause", syncIcon);

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
    // If the gate is already up, the countdown ring starts drawing the instant
    // `.loading` clears — begin the lap-1 click lock from this moment.
    if (document.documentElement.classList.contains("sound-gate")) startRingLock();
  };
  audio.addEventListener("canplaythrough", markReady);
  audio.addEventListener("playing", markReady);
  audio.addEventListener("error", markReady);
  music.addEventListener("playing", markReady);

  // Lead-in: on the FIRST start, the music plays alone for this long before the
  // voice comes in. A manual resume after a pause starts the voice immediately.
  const INTRO_LEAD_MS = 5000;
  let firstStart = true;
  let voiceLeadTimer: number | undefined;

  let gateEntered = false;
  let onGateEnter: (() => void) | null = null;
  let autoEnterTimer: number | undefined;
  let doneTimer: number | undefined;
  let startTimer: number | undefined;

  // Click lock for the gate's play button: it ignores presses until the
  // countdown ring's first lap has drawn (RING_LAP1_MS). `startRingLock` arms the
  // timer from when the ring actually begins (gate visible AND not buffering);
  // it's called from both beginGate and markReady so it fires whichever happens
  // last, and is guarded to run only once per gate.
  let clickArmed = false;
  let lockStarted = false;
  let armTimer: number | undefined;
  const armClick = () => {
    clickArmed = true;
    dom.soundPermissionBtn.classList.remove("ring-locked");
  };
  const startRingLock = () => {
    if (lockStarted || clickArmed) return;
    lockStarted = true;
    armTimer = window.setTimeout(armClick, RING_LAP1_MS);
  };

  const play = async () => {
    // A manual press (or anything that starts the track) pre-empts the pending
    // post-gate start delay.
    window.clearTimeout(startTimer);
    buildGraph();
    try {
      await ctx?.resume();
    } catch {
      /* resume may reject if not yet allowed; play() below still tries */
    }
    try {
      // MUSIC starts first and runs continuously; the duck follower kicks in.
      await music.play();
      startDuck();
    } catch {
      // Blocked (e.g. autoplay policy, since this can fire a few seconds after
      // the click) — clear the loading arc and leave the button in its stopped
      // (play-icon) state so the visitor can start it manually.
      markReady();
    }
    // VOICE leads in a few seconds after the music on the FIRST start (so the
    // music plays alone up front); a manual resume brings it back right away.
    window.clearTimeout(voiceLeadTimer);
    const startVoice = () => void audio.play().catch(() => {});
    if (firstStart) {
      firstStart = false;
      voiceLeadTimer = window.setTimeout(startVoice, INTRO_LEAD_MS);
    } else {
      startVoice();
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

  // Click the play button → dismiss WITH sound, but only once the ring's first
  // lap has drawn (clickArmed). Earlier presses are ignored so the lap always
  // completes before the gate can leave.
  const onPlayClick = () => {
    if (!clickArmed) return;
    enterFromGate(true);
  };

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

    // Lock the play button until the ring's first lap has drawn (RING_LAP1_MS).
    clickArmed = false;
    lockStarted = false;
    window.clearTimeout(armTimer);
    dom.soundPermissionBtn.classList.add("ring-locked");
    dom.soundPermissionBtn.addEventListener("click", onPlayClick);
    // The track is usually already buffered by now, so the countdown starts the
    // instant the gate is visible — arm the lock here. If it's still buffering,
    // markReady arms it when `.loading` clears (whichever happens last wins).
    if (!dom.soundPermissionBtn.classList.contains("loading")) startRingLock();

    // Auto-advance into the intro once the ring completes, even if nobody
    // interacts (Greta flow) — MUTED. A play-button click before this fires
    // pre-empts it (enterFromGate clears the timer) and starts the track.
    autoEnterTimer = window.setTimeout(() => enterFromGate(false), AUTO_ENTER_MS);
  };

  const toggle = () => {
    // Music represents "sound on" — it leads the voice, so key the toggle off it.
    if (music.paused) {
      void play();
    } else {
      window.clearTimeout(voiceLeadTimer);
      audio.pause();
      music.pause();
      stopDuck();
    }
  };

  return {
    beginGate,
    toggle,
    teardown: () => {
      window.clearTimeout(autoEnterTimer);
      window.clearTimeout(doneTimer);
      window.clearTimeout(startTimer);
      window.clearTimeout(armTimer);
      window.clearTimeout(voiceLeadTimer);
      stopDuck();
      dom.soundPermissionBtn.removeEventListener("click", onPlayClick);
      audio.pause();
      music.pause();
      music.removeEventListener("play", syncIcon);
      music.removeEventListener("pause", syncIcon);
      audio.removeEventListener("canplaythrough", markReady);
      audio.removeEventListener("playing", markReady);
      audio.removeEventListener("error", markReady);
      music.removeEventListener("playing", markReady);
      audio.src = "";
      music.src = "";
      try {
        void ctx?.close();
      } catch {
        /* already closed */
      }
    },
  };
}
