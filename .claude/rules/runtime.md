# Runtime loop & state machine

## Animation loop (`runtime/loop.ts`)

One RAF loop per frame:

1. Drive the model-load HUD crawl while loading (real-loaded floor + steady crawl + smoothed display).
2. Compute `experienceEntryProgress` and `exitProgress` from absolute timestamps on `state` against constants in `world.ts` (`EXPERIENCE_ENTRY_MS`, `EXPERIENCE_EXIT_MS`).
3. Update scroll: damping (`*= 0.82`), clamp to `[0, N-1]`, snap-to-nearest-panel when settling, then `lerp` `scrollCurrent → scrollTarget`. Keep a separate `scrollVelVis` for visual lag.
4. Position camera, then drive background sphere yaw, figure transform, and month label — each branched by phase (`experienceExitActive` / `introPreviewActive` / entry-blend / steady-state).
5. Update timeline progress and month-swap animation (cooldown + ghost element for direction-aware enter/leave).
6. Call `updatePanels(ctx)` and render both background and main scenes.

## State machine

Discrete phases tracked as booleans + `*StartMs` timestamps on `state`:

- `introActive` — initial intro page (panels hidden)
- `startupIntroSpinActive` / `introPreviewActive` — intro animations driving the figure into view
- `experienceEntryActive` — transition into the scroll experience (`enterExperience` in `transitions.ts`)
- main scrolling state (none of the above flags set)
- `experienceExitActive` (+ `exitReverseMode`) — leaving back to intro (`returnToExploreIntro`)

Transitions live in `runtime/transitions.ts`. Effects (intro line reveals, social line) live in `runtime/effects.ts`.

## Timing convention

Timings are absolute milliseconds from `performance.now()` against a `*StartMs` field on `state`, **not** delta accumulators. Phase transitions stamp the start time; the loop reads elapsed.
