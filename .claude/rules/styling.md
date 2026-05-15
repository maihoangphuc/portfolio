# Styling & color contract

CSS variables are the single source of truth for all colors.

## Palette flow

1. Define palette in `:root` of `src/app/globals.css` as `--palette-web-*`.
2. Expose via `--color-web-*` inside Tailwind v4's `@theme {}` block.
3. Tailwind classes use the `web-*` token (e.g. `bg-web-accent`, `text-web-white`).

## WebGL / canvas

Canvas and WebGL code reads colors via `readRootCssVar` / `rootCssVarToHexInt` in `src/utils/rootCssColor.ts`. **Never hardcode hex values in `.ts` files** for anything that has a CSS token.

`clayMaterial` re-syncs from CSS via `syncClayMaterialColorFromCss()` — call it after palette changes if the material is already created.

## Adding a new color

1. Add `--palette-web-foo` in `globals.css`.
2. Add `--color-web-foo: var(--palette-web-foo)` in the `@theme {}` block.
3. Use `bg-web-foo` / `text-web-foo` in JSX, or `readRootCssVar('--palette-web-foo')` in `.ts`.
