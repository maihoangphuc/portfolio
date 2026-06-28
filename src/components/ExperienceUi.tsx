import { SOCIAL_LINKS } from "@/constants/socialLinks";
import { IconPause } from "@/icons/IconPause";
import { IconPlay } from "@/icons/IconPlay";

export default function ExperienceUi() {
  return (
    <div id="ui" className="text-web-white">
      <button
        id="brand"
        type="button"
        className="cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-inherit no-underline"
        aria-label="Hoang Phuc — back to explore intro"
      >
        Hoang
        <br />
        Phuc
      </button>

      {/* Sound-permission gate (theyearofgreta.com flow): after the load
          screen, the experience is held behind a centered play button + prompt.
          The first click / tap / key / drag enables sound, animates this out,
          then reveals the intro. Wired in runtime/voice.ts (beginGate). */}
      <div id="sound-permission" className="done" aria-hidden="true">
        <button
          id="sound-permission-btn"
          className="loading text-web-white"
          type="button"
          aria-label="Enable sound and enter"
        >
          <svg
            className="sound-btn-spinner"
            viewBox="0 0 30 30"
            aria-hidden="true"
          >
            <circle cx="15" cy="15" r="14.66" />
          </svg>
          {/* Determinate ~3s countdown ring: a full border that winds down to
              empty while the gate is up. When it empties (or on click) the
              experience auto-advances to the intro. Driven purely by CSS off
              the #sound-permission.visible state; timing mirrors AUTO_ENTER_MS
              in runtime/voice.ts. */}
          <svg
            className="sound-btn-countdown"
            viewBox="0 0 30 30"
            aria-hidden="true"
          >
            <circle cx="15" cy="15" r="14.66" />
          </svg>
          <IconPlay />
        </button>
        <p id="sound-permission-text" className="text-web-muted">
          <span className="perm-line">
            <span className="perm-line-inner">For an even more immersive</span>
          </span>
          <span className="perm-line">
            <span className="perm-line-inner">
              experience, please enable sound!
            </span>
          </span>
        </p>
      </div>

      <div id="timeline">
        <span>Now</span>
        <div id="tl-bar" className="bg-web-tl-track">
          <div id="tl-progress" className="bg-web-accent" />
        </div>
        <span>2017</span>
      </div>

      <div id="social">
        <div id="sline" className="bg-web-white" />
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.key}
            className="soc"
            data-key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="soc-label">{link.label}</span>
          </a>
        ))}
      </div>

      {/* #year-lbl = small top label, month + year (e.g. "Jul 2025").
          #month-lbl = big bottom label, the CV section, with the slide swap.
          Ids kept for the existing CSS/animation. */}
      <div id="year-lbl" className="text-web-white">
        Jul 2025
      </div>
      <div id="month-lbl" className="text-web-white">
        Exp
      </div>
      <div id="month-lbl-ghost" className="text-web-white" aria-hidden="true">
        Exp
      </div>

      <div id="load-tagline" className="text-web-soft" aria-hidden="true">
        Change is coming,
        <br />
        Whether you like it or not.
      </div>

      <div
        id="model-load-pct"
        className="text-web-white model-loading"
        aria-live="polite"
        aria-busy="true"
      >
        0
      </div>

      {/* Starts `.paused` (= play icon, per the contract in globals.css) because
          the track is muted until the visitor presses play. The gate's
          auto-advance never starts audio, so the intro's button must read as
          "stopped". syncIcon() flips it to the pause icon once audio plays. */}
      <div
        id="sound-btn"
        className="loading paused border border-web-border text-web-accent"
        role="button"
        tabIndex={0}
        aria-label="Play or pause"
      >
        {/* Loading spinner — a rotating stroke arc (grow/shrink) shown only
            while the voice track loads, like theyearofgreta.com. */}
        <svg
          className="sound-btn-spinner"
          viewBox="0 0 30 30"
          aria-hidden="true"
        >
          {/* r=14.5 (not 13): with the 30-unit viewBox on the 30px button, the
              stroke centreline lands at 14.5px — exactly on the button's 1px
              border centreline — so the arc rides ON the border as one ring
              instead of a smaller inner circle. */}
          <circle cx="15" cy="15" r="14.5" />
        </svg>
        <IconPlay />
        <IconPause />
      </div>

      <div id="caption">
        <div id="cap-tag">VIDEO</div>
        <div id="cap-body" />
      </div>
    </div>
  );
}
