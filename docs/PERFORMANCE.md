# Performance

Anchor habits for this template (aligned with a practical **performance budget**).

## Budgets (guideline)

| Resource | Target | Why |
|----------|--------|-----|
| Total page weight | &lt; ~1.5 MB | Fast 3G |
| JS (compressed) | &lt; ~300 KB | Parse + execute |
| LCP image | Optimize above-the-fold | Largest Contentful Paint |
| Fonts | `font-display: swap`, subset | Limit FOIT |

## What this repo already does

- **Route rules:** Security headers on `/**`; prerender `/` for static shell.
- **Nitro:** `compressPublicAssets` for static assets.
- **Nuxt Image:** AVIF/WebP formats configured in `nuxt.config.ts`.
- **Studio result image:** `loading="lazy"`, `decoding="async"`, `fetchpriority="low"` for non-LCP preview.
- **Code splitting:** Route-based chunks (dashboard vs home) via Nuxt defaults.

## Next steps when you ship

- Run Lighthouse on `/` and `/dashboard`; track **LCP**, **INP**, **CLS**.
- Preload only true LCP assets; avoid huge client bundles — lazy-load heavy chart or editor features.
- Cache hashed assets with long `Cache-Control`; keep HTML short-cache or `no-cache` as needed.

## Measurement

```bash
bunx lighthouse http://localhost:3000 --only-categories=performance --output html --output-path ./lighthouse-home.html
```

Replace URL for `/dashboard` when the dev server is running locally.
