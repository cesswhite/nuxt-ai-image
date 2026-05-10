# Performance

Practical **budgets**, **Core Web Vitals** targets, and **what this template actually ships** versus what to add when you fork. For deeper patterns (image `picture` stacks, font loading, third-party facades), use the workspace **performance** agent skill; measure on real deploys, not only localhost.

---

## Budgets (first-load guideline)

| Resource | Target | Notes |
|----------|--------|--------|
| Total page weight | < ~1.5 MB | First meaningful route; 3G-friendly |
| JavaScript (compressed) | < ~300 KB | Parsing + main-thread cost |
| CSS (compressed) | < ~100 KB | Nuxt UI + Tailwind; grows with custom pages |
| Above-the-fold images | < ~500 KB | Use when you add marketing heroes |
| Fonts | < ~100 KB | subset + `font-display: swap` if you self-host |
| Third-party scripts | < ~200 KB | Template adds none; watch analytics/widgets |

---

## Core Web Vitals (targets)

| Metric | Target | Template notes |
|--------|--------|----------------|
| **LCP** | < 2.5 s | Home LCP is mostly **text + SVG logo** (no large hero image). Dashboard LCP depends on layout/fonts; avoid huge above-the-fold bundles. |
| **INP** | < 200 ms | Keep form handlers light; debounce heavy listeners if you add canvas/galleries. |
| **CLS** | low | Reserve space for async UI (images with width/height — studio output uses explicit `width`/`height` on `<img>`). |

---

## What this repo already does

| Item | Where / how |
|------|----------------|
| **Prerender** | `routeRules['/'].prerender = true` — static shell for `/`. |
| **Security headers** | `/**` — `nosniff`, `referrer-policy` (`nuxt.config.ts`). |
| **Long-cache client chunks (production)** | `/_nuxt/**` → `Cache-Control: public, max-age=31536000, immutable` so hashed assets cache at the edge/browser. |
| **Compressed static assets** | `nitro.compressPublicAssets: true`. |
| **`@nuxt/image` presets** | `image.format: ['avif', 'webp']` — applies when you use **`<NuxtImg>`** or module helpers. **Current pages do not use `<NuxtImg>`** (logo is SVG; preview is a plain `<img>` with a data URL). |
| **Generated preview `<img>`** | `width`/`height`, `loading="lazy"`, `decoding="async"`, `fetchpriority="low"` — **not** LCP; avoids competing with the main dashboard paint. |
| **Route-level JS splitting** | Nuxt default: home vs dashboard chunks load separately. |
| **Motion** | Short opacity/transform only; keep new motion behind `prefers-reduced-motion` if you extend animations. |

---

## API and dynamic routes

- **`POST /api/image/gpt-image-1-5`** … **`/api/image/gemini-2-5-flash-image`** (and other **`/api/image/*`** routes) should stay **uncached** for personalized results — use **`private, no-store`** or equivalent on your CDN only if you add GET caching; default Nitro behavior is fine for POST.
- Large **base64** responses stress **memory and transfer** — document limits in your fork (prompt size, output caps).

---

## When you extend the template

1. **Marketing pages with a hero** — Use **`<NuxtImg>`** (or `<picture>`) with **explicit dimensions**, **AVIF/WebP**, and **`fetchpriority="high"`** only for the **true** LCP image.
2. **Heavy widgets** (charts, editors) — **Lazy-import** route or component; avoid pulling them into `(home).vue` or the dashboard layout entry.
3. **Lists / galleries** — Virtualize or paginate; use **`content-visibility`** only where you have measured layout stability.
4. **Third-party scripts** — Prefer **async**, **facades**, or **load on interaction** (see performance skill).

---

## Measurement

```bash
# Performance category only; run while dev server or preview is up
bunx lighthouse http://localhost:3000 --only-categories=performance --output html --output-path ./lighthouse-home.html
bunx lighthouse http://localhost:3000/dashboard --only-categories=performance --output html --output-path ./lighthouse-dashboard.html
```

Use **production build** (`bun run build && bun run preview`) for scores closer to deploy. Compare before/after when changing bundles or images.

---

## Cursor skill

Project-local checklist: **`.cursor/skills/nuxt-ai-images-performance/SKILL.md`**.

---

## See also

- `docs/ARCHITECTURE.md` — layering and request flow  
- `docs/DECISIONS.md` — rationale including no client-side API keys
