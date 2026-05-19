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
  utils/
    studioImageModels.ts    # model allowlist, icons, menus
    imageApiRoutes.ts       # model ID → POST /api/image/<slug>
    geminiImageUtils.ts     # clamps, aspects, buildGeminiImageConfig
    gemini31Nanobanana2.ts  # Nanobanana 2 resolve + defaults
    geminiProNanobanana.ts  # Nanobanana Pro
    gemini25Nanobanana.ts   # Nanobanana (2.5)
    openAiImagePresets.ts
    textApiRoutes.ts
  composables/useGenerateImage.ts
  stores/studio.ts
  components/Dashboard/Studio/…
server/
  api/image/*.post.ts       # one route per model
  api/text/*.post.ts
  utils/
    imageApiCommon.ts       # readJsonBody, keys, aspectRatioFromBody
    geminiImage.ts          # stream + data URL + errors
    geminiNanobanana2Config.ts
    openAiImage.ts
    openAiImageSize.ts
    promptAssistOpenAi.ts
docs/
  IMAGE_PIPELINE.md         # full API + utils reference
  GEMINI_NANO_BANANA.md
  ARCHITECTURE.md
  DECISIONS.md
public/
  llms.txt
  pricing.md
```

## Cursor skills

Skills live under `.cursor/skills/` — open them in Cursor to steer agents on this template (conventions, performance, AI SEO basics).

## License

MIT (same as upstream starter unless you change it).
