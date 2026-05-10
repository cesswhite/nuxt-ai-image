# AGENTS — Nuxt AI Images template

This repository is the **base anchor** for new AI image web apps in the products workspace.

## Conventions

- **Package manager:** Bun only (`bun install`, `bun run dev`, `bun run build`). Do not introduce npm, pnpm, or yarn.
- **UI:** Nuxt UI v4 — semantic colors (`text-highlighted`, `bg-default`, `border-default`), `UApp` wraps the app in `app/app.vue`.
- **Routes:** Prefer route groups over `index.vue` (e.g. `pages/(home).vue` for `/`).
- **Motion:** `@vueuse/motion` — short durations (~240–320 ms), ease-out for entrance; respect `prefers-reduced-motion` in new animations.
- **Image generation:** Studio uses **`useGenerateImage`** → **`POST /api/image/<slug>`** (see `app/utils/imageApiRoutes.ts`). Thin handlers in `server/api/image/*.post.ts` delegate to **`server/utils/generateImageShared.ts`**. **Enhance / Surprise** use **`POST /api/text/*`** (`app/utils/textApiRoutes.ts`) → **`server/utils/promptAssistOpenAi.ts`**. Allowed `model` IDs: `app/utils/studioImageModels.ts`.
- **Dashboard:** `layouts/dashboard.vue` uses **`UDashboardGroup`**. **`DashboardSidebarContainer`** listens to **`useRuntimeHook('dashboard:sidebar:toggle')`** so **`USidebar`** stays in sync with **`UDashboardSidebarToggle`** (from **`UDashboardNavbar`**). Studio adds a **mobile-only** navbar (`lg:hidden`).

## Where to read more

| Doc | Purpose |
|-----|--------|
| `README.md` | Quick start, stack, structure |
| `docs/ARCHITECTURE.md` | Layers and data flow |
| `docs/DECISIONS.md` | **Why** we chose Bun, HTTP codes, route groups, etc. |
| `docs/IMAGE_PIPELINE.md` | OpenAI vs Google, request shapes |
| `docs/GEMINI_NANO_BANANA.md` | Nano Banana models, prompting, SynthID, Thinking, limits |
| `docs/GEMINI_IMAGE_UNDERSTANDING.md` | Vision: inline vs Files API, detection, tokens, media_resolution |
| `docs/PERFORMANCE.md` | Budgets, CWV targets, Nitro cache, Nuxt Image vs `<NuxtImg>`, Lighthouse |
| `docs/AI_SEO.md` | llms.txt, citations, robots |
| `docs/ANIMATION.md` | Motion presets and accessibility |

## Cursor skills

Project-local skills live in `.cursor/skills/`. Load them when editing this repo or when forking to a new product.
