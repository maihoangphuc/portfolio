const INTRO_DESCRIPTION =
  "Frontend Developer with 3+ years building scalable, high-performance web applications with React, Next.js and Vue 3.";

const INTRO_RIGHT_TEXT =
  "Thank you for taking the time to explore my work. I would welcome the opportunity to bring this same dedication to your team and build something exceptional together.";

export default function ExperienceIntro() {
  return (
    <>
      <div id="bg-name">
        <div>
          <div
            className="bg-name-img bg-web-name"
            role="img"
            aria-label="Hoang Phuc"
          />
        </div>
      </div>

      <div id="intro-left">
        <div id="intro-rule-track">
          <div id="intro-rule" className="bg-web-white" />
        </div>
        <div id="intro-desc" className="text-web-muted">
          {INTRO_DESCRIPTION}
        </div>
        <button id="explore-btn" className="text-web-white" type="button">
          <span className="explore-text-wrapper">
            {"Explore".split("").map((char, i) => (
              <span
                key={i}
                className="char"
                style={{ "--char-index": i } as React.CSSProperties}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </button>
      </div>

      <div id="intro-right">
        <div id="intro-rule-right-track">
          <div id="intro-rule-right" className="bg-web-white" />
        </div>
        <div id="intro-right-text" className="text-web-soft">
          {INTRO_RIGHT_TEXT}
        </div>
      </div>

      <div id="drag-hint">
        <div className="drag-row">
          <div
            className="drag-line drag-line-left bg-web-white"
            style={{ transformOrigin: "100% 50%" }}
          />
          <div className="drag-text text-web-white">
            {"Drag".split("").map((char, i) => (
              <span
                key={i}
                className="drag-char"
                style={{ "--drag-char-index": i } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </div>
          <div
            className="drag-line drag-line-right bg-web-white"
            style={{ transformOrigin: "0% 50%" }}
          />
        </div>
        <div className="drag-subtext text-web-white">
          {"or scroll to explore".split("").map((char, i) => (
            <span
              key={i}
              className="drag-subchar"
              style={{ "--drag-subchar-index": i } as React.CSSProperties}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
