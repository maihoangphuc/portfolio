# Panels (`runtime/panels.ts`)

`N` panels (constant in `src/constants/experience.ts`, currently 40) are arranged on a vertical helix.

Per frame:

- `panelGroup.position.y` rises with `progress`; `panelGroup.rotation.y` rotates so the active panel always faces the camera.
- Each panel's local position: `(cos(angle)*radius, -i*yDistance, sin(angle)*radius)` where `radius = baseRadius + 5*a` and `a = s - progress` (offset from the active panel). `panelsPerTurn = 3.5`.
- Custom vertex/fragment shaders apply Perlin-noise wave + curve/shear distortion + grayscale tint, with a `uHoverProgress` ramp on the centered panel.

## Tuning knobs

- `PW` / `PH` in `src/constants/experience.ts` — panel size
- `baseRadius` in `panels.ts` — orbit width
- `N` in `src/constants/experience.ts` — panel count
