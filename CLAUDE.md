# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`profile_2` — Next.js 16 (App Router) + React 19 + Three.js single-page portfolio. The entire page is one continuous 3D scroll experience driven by an imperative runtime that owns three canvases.

Detailed rules live in [`.claude/rules/`](./.claude/rules). Load the file that matches the task:

| Topic | File |
|-------|------|
| Page composition & runtime wire-up | [.claude/rules/architecture.md](./.claude/rules/architecture.md) |
| Animation loop, state machine, transitions | [.claude/rules/runtime.md](./.claude/rules/runtime.md) |
| Panel helix math & shader tuning | [.claude/rules/panels.md](./.claude/rules/panels.md) |
| Colors, CSS vars, WebGL color reads | [.claude/rules/styling.md](./.claude/rules/styling.md) |

## Commands

- `yarn dev` — Next.js dev server on http://localhost:3000
- `yarn build` / `yarn start` — production build / run
- `yarn lint` — ESLint (no test runner configured)

Path alias `@/*` → `src/*`.

## Quick rules (always apply)

- Runtime is mounted once via `useGretaExperience()`; state lives on `RuntimeContext`, not React. Don't lift it into React state.
- Adding a UI element the runtime touches → give it a stable `id`, then update both `Dom` in `runtime/types.ts` and `getDom()` in `runtime/ui.ts` (it throws on missing ids).
- Animation timings are absolute ms (`performance.now()` vs `*StartMs` on `state`), not delta accumulators.
- Never hardcode hex colors in `.ts`. Add a `--palette-web-*` CSS var in `globals.css` and read it through `src/utils/rootCssColor.ts`.
- `public/3d.glb` and `public/rock.glb` are loaded by `runtime/models.ts` — don't rename without updating it.
