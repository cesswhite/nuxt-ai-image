# Nuxt AI Images

**Anchor template** for building AI image web apps with **Nuxt 4**, **Nuxt UI v4**, **Pinia**, and **VueUse Motion**. Use it as the starting point for new products that call OpenAI GPT Image, Google Gemini / Imagen, or your own hosted models.

## Highlights

- **Landing** (`/`) and **dashboard** (`/dashboard`) — sidebar shell aligned with Screenlify-style Nuxt UI patterns.
- **`POST /api/generate-image`** — validates input; **demo mode** returns an inline SVG (no API keys). Implement real SDK calls in one file when you are ready (`docs/IMAGE_PIPELINE.md`).
- **Documentation** in `docs/` — architecture, **design decisions & rationale** (`DECISIONS.md`), performance budget, AI SEO, animation notes.
- **Agent context** — `AGENTS.md`, `public/llms.txt`, `public/pricing.md` (replace with your product copy).

## Requirements

- [Bun](https://bun.sh/) (recommended for this monorepo workspace).

## Setup

```bash
cd nuxt-ai-images
bun install
cp .env.example .env
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Open studio** → **Generate** (works with demo mode).

## Scripts

| Command | Description |
|--------|-------------|
| `bun run dev` | Dev server with HMR |
| `bun run build` | Production build to `.output` |
| `bun run preview` | Preview production build |

## Environment

See `.env.example`. For local iteration without provider keys, keep:

`NUXT_PUBLIC_IMAGE_GEN_DEMO=true`

Set `NUXT_PUBLIC_SITE_URL` for correct `og:url` and SEO when you deploy.

## Project layout (abbreviated)

```
app/
  components/Dashboard/DashboardShell.vue
  composables/useGenerateImage.ts
  layouts/dashboard.vue
  pages/(home).vue
  pages/dashboard/(studio).vue
  pages/dashboard/settings.vue
  stores/studio.ts
server/
  api/generate-image.post.ts
docs/
  DECISIONS.md
public/
  llms.txt
  pricing.md
.cursor/skills/
```

## Cursor skills

Skills live under `.cursor/skills/` — open them in Cursor to steer agents on this template (conventions, performance, AI SEO basics).

## License

MIT (same as upstream starter unless you change it).
