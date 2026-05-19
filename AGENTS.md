# AGENTS — Nuxt AI Images template

This repository is the **base anchor** for new AI image web apps in the products workspace.

## Conventions

- **Package manager:** Bun only (`bun install`, `bun run dev`, `bun run build`). Do not introduce npm, pnpm, or yarn.
- **UI:** Nuxt UI v4 — semantic colors (`text-highlighted`, `bg-default`, `border-default`), `UApp` wraps the app in `app/app.vue`.
- **Routes:** Prefer route groups over `index.vue` (e.g. `pages/(home).vue` for `/`).
- **Motion:** `@vueuse/motion` — short durations (~240–320 ms), ease-out for entrance; respect `prefers-reduced-motion` in new animations.
- **Dashboard:** `layouts/dashboard.vue` uses **`UDashboardGroup`**. **`DashboardSidebarContainer`** listens to **`useRuntimeHook('dashboard:sidebar:toggle')`** so **`USidebar`** stays in sync with **`UDashboardSidebarToggle`** (from **`UDashboardNavbar`**). Studio adds a **mobile-only** navbar (`lg:hidden`).

## Image generation flow

1. **`useGenerateImage`** → **`POST /api/image/<slug>`** (`app/utils/imageApiRoutes.ts`).
2. Allowed models: **`app/utils/studioImageModels.ts`** (`STUDIO_IMAGE_MODEL`).
3. Request parsing/clamps: **`app/utils/geminiImageUtils.ts`** + **`gemini31Nanobanana2.ts`** / **`geminiProNanobanana.ts`** / **`gemini25Nanobanana.ts`** (used by client and server).
4. Routes: **`server/api/image/*.post.ts`** — thin orchestration.
5. Server helpers: **`server/utils/imageApiCommon.ts`** (body, keys), **`geminiImage.ts`** (stream), **`geminiNanobanana2Config.ts`** (3.1 config), **`openAiImage.ts`** + **`openAiImageSize.ts`**.
6. **Enhance / Surprise:** **`POST /api/text/*`** (`app/utils/textApiRoutes.ts`) → **`server/utils/promptAssistOpenAi.ts`**.

Do not duplicate clamp/parse logic in routes; extend **`app/utils`** and reuse **`resolve*Request()`**.

## Where to read more

| Doc | Purpose |
|-----|--------|
| `README.md` | Quick start, stack, structure |
| `docs/ARCHITECTURE.md` | Layers and data flow |
| `docs/DECISIONS.md` | **Why** we chose Bun, HTTP codes, route groups, etc. |
| `docs/IMAGE_PIPELINE.md` | Routes, POST bodies, `app/utils` + `server/utils` map |
| `docs/GEMINI_NANO_BANANA.md` | Nano Banana models, prompting, SynthID, Thinking, limits |
| `docs/GEMINI_IMAGE_UNDERSTANDING.md` | Vision: inline vs Files API, detection, tokens, media_resolution |
| `docs/PERFORMANCE.md` | Budgets, CWV targets, Nitro cache, Nuxt Image vs `<NuxtImg>`, Lighthouse |
| `docs/AI_SEO.md` | llms.txt, citations, robots |
| `docs/ANIMATION.md` | Motion presets and accessibility |

## Cursor skills

Project-local skills live in `.cursor/skills/`. Load them when editing this repo or when forking to a new product.
