# AGENTS — Nuxt AI Images template

This repository is the **base anchor** for new AI image web apps in the products workspace.

## Conventions

- **Package manager:** Bun only (`bun install`, `bun run dev`, `bun run build`). Do not introduce npm, pnpm, or yarn.
- **UI:** Nuxt UI v4 — semantic colors (`text-highlighted`, `bg-default`, `border-default`), `UApp` wraps the app in `app/app.vue`.
- **Routes:** Prefer route groups over `index.vue` (e.g. `pages/(home).vue` for `/`).
- **Motion:** `@vueuse/motion` — short durations (~240–320 ms), ease-out for entrance; respect `prefers-reduced-motion` in new animations.
- **Image generation:** Client calls `POST /api/generate-image`. Demo mode is controlled by `NUXT_PUBLIC_IMAGE_GEN_DEMO`. Real SDK code belongs in `server/api/generate-image.post.ts`.

## Where to read more

| Doc | Purpose |
|-----|--------|
| `README.md` | Quick start, stack, structure |
| `docs/ARCHITECTURE.md` | Layers and data flow |
| `docs/DECISIONS.md` | **Why** we chose Bun, demo mode, HTTP codes, route groups, etc. |
| `docs/IMAGE_PIPELINE.md` | OpenAI vs Google, request shapes |
| `docs/PERFORMANCE.md` | Budgets, LCP, JS size |
| `docs/AI_SEO.md` | llms.txt, citations, robots |
| `docs/ANIMATION.md` | Motion presets and accessibility |

## Cursor skills

Project-local skills live in `.cursor/skills/`. Load them when editing this repo or when forking to a new product.
