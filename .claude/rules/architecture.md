# Architecture

No routing or data layer. The whole app is one stateful runtime that owns the DOM and three canvases.

## Page composition (`src/app/page.tsx`)

Four sibling components, in order:

1. `ExperienceCanvases` — three stacked `<canvas>`es: `#bg` (shader background sphere), `#c` (main Three.js scene), `#particles` (2D overlay).
2. `ExperienceIntro` / `ExperienceUi` — all interactive DOM (timeline, social links, brand button, sound toggle, model-load %, drag hint). Every element the runtime touches has a stable `id`.
3. `GretaExperienceRuntime` — `"use client"` shim that calls `useGretaExperience()`, which runs `startExperience()` once on mount and tears it down on unmount.

## Runtime entry (`src/lib/experience/runtime/index.ts`)

`startExperience()` wires everything and returns a teardown:

- `getDom()` (in `ui.ts`) collects every required DOM element by id into a typed `Dom`. **It throws if any id is missing** — new runtime-touched DOM must be added to `Dom` in `types.ts` and `getDom()` in `ui.ts`.
- `initGretaBackground()` (in `lib/experience/background/`) — shader-noise sphere on `#bg`.
- `initScene()` — main Three.js scene, camera, renderer (`#c`), lights.
- `createPanels()` — orbiting image panel ring (helix).
- `loadModels()` — async-loads `/3d.glb` and `/rock.glb`, drives the load-percent HUD, applies `clayMaterial`.
- `bindEvents()` — wheel/drag/resize/social/sound listeners; returns teardown.
- `createAnimateLoop()` — starts the RAF loop.

A single `RuntimeContext` object (`types.ts`) is threaded through every module — it carries `dom`, mutable `state`, renderer/scene/camera, the panel group, timers, and animation flags. Modules do not import each other's internal state.

## File map

- `src/lib/experience/runtime/` — runtime split by concern: `index.ts` (wire-up), `loop.ts` (RAF), `world.ts` (state factory + timing constants), `types.ts` (`Dom`, `State`, `RuntimeContext`), plus `scene.ts`, `models.ts`, `panels.ts`, `particles.ts`, `events.ts`, `ui.ts`, `transitions.ts`, `effects.ts`, `math.ts`.
- `src/lib/experience/background/` — shader sphere background (separate scene/renderer).
- `src/constants/experience.ts` — `N`, `PW`, `PH`, `MONTHS`.
- `public/3d.glb`, `public/rock.glb` — loaded at runtime.
