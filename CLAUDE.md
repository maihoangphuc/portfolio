# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` — start Next.js dev server on http://localhost:3000
- `yarn build` — production build
- `yarn start` — run the built app
- `yarn lint` — ESLint (config at `eslint.config.mjs`, extends `eslint-config-next`)

No test runner is configured.

Path alias `@/*` → `src/*` (see `tsconfig.json`).

## Architecture

This is a single-page Next.js 16 (App Router) + React 19 + Three.js portfolio whose entire page is one continuous 3D scroll experience inspired by theyearofgreta.com. There is no routing or data layer — everything is one stateful runtime that owns the DOM and three canvases.

### Page composition (`src/app/page.tsx`)

Renders four sibling components, in this order, that together set up the runtime:

1. `ExperienceCanvases` — three stacked `<canvas>` elements: `#bg` (shader background sphere), `#c` (main Three.js scene), `#particles` (2D canvas overlay).
2. `ExperienceIntro` / `ExperienceUi` — all interactive DOM (timeline, social links, brand button, sound toggle, model-load %, drag hint, etc.). Every element the runtime touches has a stable `id` attribute.
3. `GretaExperienceRuntime` — `"use client"` shim whose only job is to call `useGretaExperience()`, which calls `startExperience()` once on mount and tears it down on unmount.

### Runtime entry point (`src/lib/experience/runtime/index.ts`)

`startExperience()` wires everything together and returns a teardown function:

- `getDom()` (in `ui.ts`) collects every required DOM element by id into a typed `Dom` object. It throws if any id is missing — **adding a new UI element that the runtime needs means updating both `Dom` in `types.ts` and `getDom()` in `ui.ts`.**
- `initGretaBackground()` (in `lib/experience/background/`) sets up the shader-noise sphere on `#bg`.
- `initScene()` builds the main Three.js scene, camera, renderer (`#c`), and lights.
- `createPanels()` builds the orbiting image panel ring (helix) around the figure.
- `loadModels()` async-loads `/3d.glb` (figure) and `/rock.glb` from `public/`, drives the load-percent HUD, and applies the shared `clayMaterial`.
- `bindEvents()` registers wheel/drag/resize/social/sound listeners and returns a teardown.
- `createAnimateLoop()` starts the `requestAnimationFrame` loop.

A single `RuntimeContext` object (`types.ts`) is threaded through every module — it carries `dom`, mutable `state`, the renderer/scene/camera, the panel group, timers, and animation flags. All cross-module state lives there; modules do not import each other's internal state.

### Animation loop (`runtime/loop.ts`)

One RAF loop per frame:

1. Drive the model-load HUD crawl while loading (real-loaded floor + steady crawl + smoothed display).
2. Compute `experienceEntryProgress` and `exitProgress` from absolute timestamps in `state` against constants in `world.ts` (`EXPERIENCE_ENTRY_MS`, `EXPERIENCE_EXIT_MS`, etc.).
3. Update scroll: damping (`*= 0.82`), clamp to `[0, N-1]`, snap-to-nearest-panel when settling, then `lerp` `scrollCurrent → scrollTarget`. Keep a separate `scrollVelVis` for visual lag.
4. Position camera, then drive the background sphere yaw, the figure transform, and the month label — each branched by phase (`experienceExitActive` / `introPreviewActive` / entry-blend / steady-state).
5. Update the timeline progress and month-swap animation (with cooldown + ghost element for direction-aware enter/leave).
6. Call `updatePanels(ctx)` and render both the background and main scenes.

### State machine

The experience has discrete phases tracked as booleans + start-timestamps on `state`:

- `introActive` — initial intro page (panels hidden)
- `startupIntroSpinActive` / `introPreviewActive` — intro animations driving the figure into view
- `experienceEntryActive` — transition into the scroll experience (`enterExperience` in `transitions.ts`)
- main scrolling state (none of the above flags set)
- `experienceExitActive` (+ `exitReverseMode`) — leaving back to intro (`returnToExploreIntro`)

Transitions live in `runtime/transitions.ts`. Effects (intro line reveals, social line) live in `runtime/effects.ts`.

### Panels (`runtime/panels.ts`)

`N` panels (constant in `src/constants/experience.ts`, currently 40) are arranged on a vertical helix. Per-frame:

- `panelGroup.position.y` rises with `progress`, and `panelGroup.rotation.y` rotates so the active panel always faces the camera.
- Each panel's local position is `(cos(angle)*radius, -i*yDistance, sin(angle)*radius)` where `radius = baseRadius + 5*a` and `a = s - progress` (offset from the active panel). `panelsPerTurn = 3.5`.
- Custom vertex/fragment shaders apply Perlin-noise wave + curve/shear distortion + grayscale tint, with a `uHoverProgress` ramp on the centered panel.

Tuning knobs: `PW`/`PH` in `constants/experience.ts` for panel size, `baseRadius` in `panels.ts` for orbit width.

### Color contract

CSS variables are the single source of truth for all colors:

- Define palette in `:root` of `src/app/globals.css` as `--palette-web-*`, then expose via `--color-web-*` inside Tailwind v4's `@theme {}` block.
- Tailwind classes use the `web-*` token (e.g. `bg-web-accent`, `text-web-white`).
- Canvas / WebGL code reads colors via `readRootCssVar` / `rootCssVarToHexInt` in `src/utils/rootCssColor.ts` — **never hardcode hex values in `.ts` files** for anything that has a CSS token. `clayMaterial` re-syncs from CSS via `syncClayMaterialColorFromCss()`.

### File map (high signal)

- `src/lib/experience/runtime/` — the runtime, split by concern:
  - `index.ts` (wire-up), `loop.ts` (RAF), `world.ts` (state factory + timing constants), `types.ts` (`Dom`, `State`, `RuntimeContext`)
  - `scene.ts`, `models.ts`, `panels.ts`, `particles.ts`, `events.ts`, `ui.ts`
  - `transitions.ts`, `effects.ts` (phase changes + DOM line reveals)
  - `math.ts` (`lerp`, `smootherstep01`, exit-rotation helper)
- `src/lib/experience/background/` — shader sphere background (separate scene/renderer).
- `src/constants/experience.ts` — `N`, `PW`, `PH`, `MONTHS`.
- `public/3d.glb`, `public/rock.glb` — loaded at runtime; do not rename without updating `models.ts`.

## Conventions

- The runtime is mounted exactly once in a `useEffect`; it is a long-lived imperative subsystem, not React state. Don't try to lift its state into React — pass via `RuntimeContext` instead.
- Animation timings are absolute milliseconds derived from `performance.now()` against a `*StartMs` field, not delta accumulators. Phase transitions stamp the start time and read elapsed in the loop.
- Keep WebGL/Canvas color literals out of `.ts`. If you need a new color in three.js code, add a CSS var in `globals.css` first and read it through `rootCssColor.ts`.
- New interactive DOM goes in `ExperienceUi.tsx` / `ExperienceIntro.tsx` (with stable `id`s) and is registered in `Dom` + `getDom()`.
