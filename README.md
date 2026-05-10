# Nuxt AI Images

**Anchor template** for building AI image web apps with **Nuxt 4**, **Nuxt UI v4**, **Pinia**, and **VueUse Motion**. Use it as the starting point for new products that call OpenAI GPT Image, Google Gemini / Imagen, or your own hosted models.

## Highlights

- **Landing** (`/`) and **dashboard** (`/dashboard`) — **Nananuxt Relight–style** shell: `UNavigationMenu` sidebar, `UDashboardPanel` body-only, **12-column** grid (**2 / 8 / 2**), sticky **Generate** rail.
- **`POST /api/image/*`** — one route per image model; set keys in `.env` (`docs/IMAGE_PIPELINE.md`).
- **`POST /api/text/enhance-prompt`** / **`POST /api/text/surprise-prompt`** — OpenAI chat helpers for the studio (`server/utils/promptAssistOpenAi.ts`).
- **Documentation** in `docs/` — architecture, **[performance](./docs/PERFORMANCE.md)** (budgets, CWV, caching), **design decisions** (`DECISIONS.md`), AI SEO, animation. **Gemini:** [Nano Banana (image generation)](docs/GEMINI_NANO_BANANA.md), [image understanding / vision](docs/GEMINI_IMAGE_UNDERSTANDING.md) (see also `IMAGE_PIPELINE.md`).
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

Open [http://localhost:3000](http://localhost:3000) → **Open studio** → **Generate** (requires the API key for the provider you select).

## Scripts

| Command | Description |
|--------|-------------|
| `bun run dev` | Dev server with HMR |
| `bun run build` | Production build to `.output` |
| `bun run preview` | Preview production build |

## Environment

See `.env.example`. Set `OPENAI_API_KEY` and/or `GEMINI_API_KEY` (or `GOOGLE_API_KEY` / `NUXT_GEMINI_API_KEY`) depending on the studio provider. Set `NUXT_PUBLIC_SITE_URL` for correct `og:url` and SEO when you deploy.

## Project layout (abbreviated)

```
app/
  components/Dashboard/Sidebar/Container.vue
  components/Dashboard/Studio/Container.vue
  components/Dashboard/PageNavbar.vue
  layouts/dashboard.vue
  pages/(home).vue
  pages/dashboard/(studio).vue
  pages/dashboard/settings.vue
  composables/useDashboardSidebarOpen.ts
  composables/useGenerateImage.ts
  stores/studio.ts
server/
  api/image/
    gpt-image-1-5.post.ts
    gpt-image-2.post.ts
    gemini-3-1-flash-image-preview.post.ts
    gemini-3-pro-image-preview.post.ts
    gemini-2-5-flash-image.post.ts
  api/text/
    enhance-prompt.post.ts
    surprise-prompt.post.ts
  utils/generateImageShared.ts
  utils/promptAssistOpenAi.ts
docs/
  DECISIONS.md
  GEMINI_IMAGE_UNDERSTANDING.md
  GEMINI_NANO_BANANA.md
  IMAGE_PIPELINE.md
public/
  llms.txt
  pricing.md
.cursor/skills/
```

## Cursor skills

Skills live under `.cursor/skills/` — open them in Cursor to steer agents on this template (conventions, performance, AI SEO basics).

## License

MIT (same as upstream starter unless you change it).
