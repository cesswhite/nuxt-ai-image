# Architecture

For **why** these choices were made (Bun, HTTP codes, route groups, docs split, etc.), see **[DECISIONS.md](./DECISIONS.md)**.

## Dashboard layout (Nananuxt Relight parity)

- **`layouts/dashboard.vue`** — Wraps the dashboard in **`UDashboardGroup`** (`storage-key="nuxt-ai-images-dashboard"`) so **`useDashboard()`** / **`UDashboardPanel`** / **`UDashboardNavbar`** share context; tune **`ui.dashboardGroup.base`** in `app.config.ts` (avoids default `fixed inset-0` inside `UApp`).
- **`components/Dashboard/Sidebar/Container.vue`** — Matches **`nananuxt/.../Sidebar/Container.vue`**: **`USidebar`** (`rail`, `inset`, compact `:ui`), **`UNavigationMenu`** for **Studio** / **Settings**, header logo, footer **Home**.
- **`composables/useDashboardSidebarOpen.ts`** — Same idea as Nananuxt: sidebar open state in **`localStorage`**.
- **Studio** — **`UDashboardPanel`** with **`#body`** (Relight grid) and **`#header`** containing **`DashboardPageNavbar`** only below **`lg`** (`class="lg:hidden"`) so desktop stays full-bleed; navbar uses built-in **`UDashboardSidebarToggle`** for mobile.
- **`components/Dashboard/Studio/Container.vue`** — Mirrors **`Relight/Container.vue`**: **`h-screen`**, **`grid-cols-12 min-h-screen gap-1 p-1`**, columns **`col-span-2` / `col-span-8` / `col-span-2`**, side columns **`scrollbar-hide`** + vertical scroll, center preview, **sticky** bottom rail with **`beautify`** primary (same rhythm as **Relight Generate**).
- **Settings** — Same pattern as **Create** in Nananuxt: **`UDashboardPanel`** **`#header`** → **`DashboardPageNavbar`** + padded **`#body`**.

## Stack

- **Nuxt 4** — SSR, Nitro server routes, file-based routing.
- **Nuxt Image** — `image.format` AVIF/WebP applies when you use **`<NuxtImg>`**; the template’s home/studio paths use SVG + plain `<img>` for the preview until you add raster heroes.
- **Nuxt UI 4** — `UDashboardPanel`, `USidebar`, `UNavigationMenu`, forms, cards; `app.config.ts` (emerald/zinc, `beautify`, subtle cards, outline controls).
- **Pinia** — `useStudioStore` holds prompt, provider, model, aspect ratio, last output, loading/error.
- **VueUse Motion** — Same motion hints as Relight (`visible-once`, staggered delays on rails).

## Request flow

1. User edits form in **`DashboardStudioContainer`** (loaded from `app/pages/dashboard/(studio).vue`).
2. `useGenerateImage().generate()` resolves the URL with **`postUrlForImageModel`** (`app/utils/imageApiRoutes.ts`) and **`POST`s** to **`/api/image/<model-slug>`** — one route per studio model.
3. The matching **`server/api/image/*.post.ts`** reads the body and calls **`server/utils/generateImageShared.ts`**, which invokes **OpenAI** (`images.generate`) or **Google GenAI** (`generateContent` with image output). Missing key for the selected provider → **503**; vendor failure or empty image → **502** (or upstream status when exposed).
4. **Enhance prompt** / **Surprise me** call **`POST /api/text/enhance-prompt`** and **`POST /api/text/surprise-prompt`** (`server/utils/promptAssistOpenAi.ts`, OpenAI chat). Same **`OPENAI_API_KEY`** as GPT Image; optional **`OPENAI_PROMPT_MODEL`**.

## Forking to a new product

1. Copy the repo (or subtree) into a new folder.
2. Rename branding strings and `AppLogo` if needed.
3. Extend **`server/utils/generateImageShared.ts`** or add a **`server/api/image/*.post.ts`** route using the same response shape: `{ output: string, provider, model }`.
4. Add auth, rate limits, and credits when you move beyond a template.

## Security

- **Never** expose `OPENAI_API_KEY` or `GEMINI_API_KEY` to the client — they stay in `runtimeConfig` (server-only).
- Validate and size-limit prompts and any reference image payloads before calling vendors.
