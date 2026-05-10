# Design decisions and rationale

This document explains **why** the template is structured the way it is, not only **what** it contains. Use it when you fork the repo or debate changes with your team.

---

## `UDashboardPanel`, sidebar, and Relight grid (Nananuxt)

**Decision:** **Studio** follows **`relight.vue`**: **`UDashboardPanel`** with **full-bleed body** (`py-0! p-0!`). **`layouts/dashboard.vue`** wraps routes in **`UDashboardGroup`** (with **`ui.dashboardGroup.base`** overriding the default full-screen `fixed` shell so it plays nicely under **`UApp`**). **Settings** uses **`#header`** + **`DashboardPageNavbar`**. **Sidebar** uses **`USidebar`** + **`useRuntimeHook('dashboard:sidebar:toggle')`** so **`UDashboardNavbar`**’s **`UDashboardSidebarToggle`** opens/closes the same sidebar on mobile.

**Why:** Nuxt UI’s **`UDashboardPanel`** / **`UDashboardNavbar`** expect a **`UDashboardGroup`** ancestor for context. Relight stays **navbar-free on desktop**; we add **`DashboardPageNavbar` + `lg:hidden`** only so small screens get a proper **`UDashboardSidebarToggle`**. **Settings** keeps a visible navbar on all breakpoints.

---

## Nuxt 4 + Nitro server routes

**Decision:** Full Nuxt with **one Nitro route per image model** under `server/api/image/*.post.ts`, sharing **`server/utils/generateImageShared.ts`**.

**Why:** Image APIs must use **secret keys** and often **large payloads**. Keeping calls on the server avoids exposing keys in the browser, matches how production apps (e.g. Screenlify, nananuxt) structure AI routes, and lets you add auth, rate limits, and logging in one place later. Split routes make each model’s contract obvious and keep handlers small; Nitro runs everywhere Nuxt deploys (Node, serverless, edge with caveats for vendor SDKs).

---

## Bun as the package manager

**Decision:** Document and standardise on **Bun** (`bun install`, `bun run`).

**Why:** The parent **products** workspace already mandates Bun for consistency, faster installs, and a single lockfile story. The template follows that so every cloned project behaves the same in CI and in Cursor agents without npm/pnpm/yarn drift.

---

## Nuxt UI v4 and semantic tokens

**Decision:** Use **Nuxt UI** components (`USidebar`, `UCard`, `UForm`, etc.) and Tailwind **semantic** classes (`text-highlighted`, `bg-default`, `border-default`, `text-dimmed`).

**Why:** The goal was a **minimal dashboard** aligned with Screenlify: accessible components, dark mode, and theme tokens instead of hardcoded palette colours. That keeps forks visually consistent when you change `app.config.ts`, and matches a strict theme-token discipline across related projects.

---

## VueUse Motion (not CSS-only, not heavy animation libs)

**Decision:** Add **`@vueuse/motion/nuxt`** with short **opacity/transform** motion on the landing block and studio cards.

**Why:** Motion should follow familiar rules: **ease-out**, **~240–320 ms**, GPU-friendly properties. VueUse Motion integrates cleanly with Nuxt, avoids a second animation framework, and stays easy to gate behind **prefers-reduced-motion** later. Motion stays subtle so the studio remains comfortable for repeated generations.

---

## Pinia + a small `useStudioStore`

**Decision:** Centralise form/output state in **Pinia** instead of only local component state.

**Why:** Real products soon need **persistence**, **multi-step flows**, or **shared state** between studio and future pages (gallery, settings). Pinia is SSR-friendly and matches other dashboards in the workspace. The store stays intentionally small so the template does not pretend to be a finished SaaS.

---

## Real provider calls in `generateImageShared.ts`

**Decision:** The shared module calls **OpenAI** (`openai` SDK, `images.generate`) or **Google GenAI** (`@google/genai`, `generateContent` with image output) from thin **`server/api/image/*`** handlers — one entry point per model. No placeholder or “demo only” branch.

**Why:** The studio should always reflect **real** billing, latency, and errors for the chosen vendor. Local development uses real keys in `.env` (or a stub backend you swap in yourself).

---

## HTTP codes in image routes

**Decision:** **400** invalid body; **503** missing API key for the selected provider; **502** (or upstream status) when the vendor returns an error or no image.

**Why:** Missing keys are configuration problems. Bad requests are client errors. Provider failures are gateway/bad-response semantics distinct from a generic 500.

---

## Shared response contract (`output` string)

**Decision:** The API returns **`output`** as a string suitable for `<img src>` (data URL or HTTPS URL).

**Why:** Matches existing patterns in sibling projects (`output` on image responses). One field keeps the client thin; you can add `outputs[]`, streaming, or metadata in a fork without breaking adopters if you version or use optional fields.

---

## Route groups: `(home).vue` and `dashboard/(studio).vue`

**Decision:** Avoid a root `index.vue`; use **`(home).vue`** for `/` and **`(studio).vue`** under `dashboard/` for `/dashboard`.

**Why:** File-based routing is clearer when filenames express intent (“home”, “studio”) without changing URLs. It scales when more dashboard sections are added.

---

## Prerender `/` + security headers on `/**`

**Decision:** **`routeRules`**: prerender the landing route; set **`x-content-type-options`** and **`referrer-policy`** broadly.

**Why:** The landing page is largely static—prerendering helps **TTFB** and aligns with a performance-minded setup. Baseline headers are cheap hygiene; tighten further at the CDN when you deploy.

---

## `public/llms.txt` and `public/pricing.md`

**Decision:** Ship machine-readable **llms** and **pricing** stubs in `public/`.

**Why:** AI SEO and agentic flows benefit from **`llms.txt`** and parseable **`pricing.md`** so assistants can read product context and plans without depending on client-only rendering. The template shows the pattern; replace content when the fork becomes a real product.

---

## Documentation split (`ARCHITECTURE`, `IMAGE_PIPELINE`, `PERFORMANCE`, `AI_SEO`, `ANIMATION`, `DECISIONS`)

**Decision:** Several short docs instead of one enormous README.

**Why:** Topics (**stack**, **vendor wiring**, **Web Vitals**, **citations**, **motion**, **rationale**) evolve at different speeds. Split docs make forks and Cursor skills easier to target without scrolling a single file.

---

## Cursor skills under `.cursor/skills/`

**Decision:** Repo-local **skills** for template conventions, performance, and AI SEO.

**Why:** Agents need explicit rules (Bun, tokens, where APIs live). Colocated skills keep behaviour repeatable when you clone this repo for a new AI image product.

---

## Performance defaults (prerender, cache, images)

**Decision:** **`/`** is **prerendered**; in **production**, **`/_nuxt/**`** gets long **`immutable`** cache headers; **Nitro** compresses public assets. **`@nuxt/image`** is configured for AVIF/WebP but **`<NuxtImg>`** is optional until marketing pages add raster heroes. The studio **preview** `<img>` uses **`lazy`**, **`async` decode**, **`fetchpriority="low"`**, and explicit dimensions to limit **CLS** and LCP competition.

**Why:** Cheap wins for static shell and hashed chunks; honest docs avoid implying Nuxt Image optimizes assets you never route through it. Details and budgets: **`docs/PERFORMANCE.md`**.

---

## What we deliberately did *not* include

- **No** auth, billing, or credits — those vary per product; this stays an **anchor**, not a full vertical.
- **No** NDJSON streaming in v1 — add when you need live multi-image previews like production studio UIs.

If you change any of these defaults in a fork, add a short note in your own `DECISIONS.md` so the next maintainer understands the trade-off.
