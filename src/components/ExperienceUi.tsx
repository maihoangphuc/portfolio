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

      <div
        id="sound-btn"
        className="border border-web-border text-web-accent"
        role="button"
        tabIndex={0}
        aria-label="Play or pause"
      >
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
