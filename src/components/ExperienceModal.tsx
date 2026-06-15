// Panel detail modal. Opened by the runtime (runtime/modal.ts) when a panel is
// clicked; all show/hide is driven imperatively by toggling the `.open` class
// and writing into these ids — never lift this into React state (see CLAUDE.md).
export default function ExperienceModal() {
  return (
    <div id="panel-modal" aria-hidden="true" role="dialog" aria-modal="true">
      <div id="panel-modal-backdrop" />
      <button
        id="panel-modal-close"
        type="button"
        aria-label="Close"
        className="text-web-white"
      >
        <span />
        <span />
      </button>
      <div id="panel-modal-card">
        <div id="panel-modal-figure">
          {/* Source is set imperatively by the runtime; next/image can't be
              driven this way and would need remote-pattern config per host. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="panel-modal-img" alt="" />
          <span id="panel-modal-index" className="text-web-white" />
        </div>
        <div id="panel-modal-text">
          <h2 id="panel-modal-title" className="text-web-white" />
          <p id="panel-modal-desc" className="text-web-soft" />
        </div>
      </div>
    </div>
  );
}
