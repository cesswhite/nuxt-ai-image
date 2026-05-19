# Image pipeline

Image generation uses **one HTTP route per studio model** under **`/api/image/*`**. Routes stay thin: they read the body, resolve options, and call shared server helpers. URL slugs replace **dots** in Google model IDs with **hyphens** (e.g. `gemini-3.1-flash-image-preview` → `/api/image/gemini-3-1-flash-image-preview`).

| Layer | Role |
|-------|------|
| **`app/utils/imageApiRoutes.ts`** | `postUrlForImageModel()` — canonical model ID → `POST /api/image/<slug>` |
| **`app/utils/studioImageModels.ts`** | Allowlist, labels, icons, provider menus |
| **`app/utils/gemini*.ts`** | Per-model defaults + `resolve*Request()` (shared by client and server) |
| **`app/utils/geminiImageUtils.ts`** | Clamps, stop sequences, aspect lists, `buildGeminiImageConfig()` |
| **`server/api/image/*.post.ts`** | One handler per model |
| **`server/utils/*`** | Body parsing, streaming, OpenAI/Gemini errors, Nanobanana 2 API config |

---

## Contract — `POST /api/image/…`

| Route | Model ID | Body |
|-------|----------|------|
| `POST /api/image/gpt-image-1-5` | `gpt-image-1.5` | `prompt` (required), `aspect_ratio?`, `openai_quality?` |
| `POST /api/image/gpt-image-2` | `gpt-image-2` | `prompt` (required), `openai_size?`, `openai_quality?` |
| `POST /api/image/gemini-3-1-flash-image-preview` | `gemini-3.1-flash-image-preview` | `prompt` (required), `aspect_ratio?`, plus **flat** Nanobanana 2 fields — see below |
| `POST /api/image/gemini-3-pro-image-preview` | `gemini-3-pro-image-preview` | `prompt`, `aspect_ratio?`, `nanobanana_pro?` object |
| `POST /api/image/gemini-2-5-flash-image` | `gemini-2.5-flash-image` | `prompt`, `aspect_ratio?`, `nanobanana_25?` object |

**Response** (same shape for every route):

```json
{
  "output": "data:image/png;base64,...",
  "provider": "openai",
  "model": "gpt-image-1.5"
}
```

`output` is a **data URL** the client can use in `<img src>`. Gemini routes return `provider: "google-gemini"`.

### Nanobanana 2 — flat POST fields

The studio sends these at the **top level** of the JSON body (not nested). The route calls `resolveNanobanana2Request(body)` in **`app/utils/gemini31Nanobanana2.ts`** and builds the Gemini `config` in **`server/utils/geminiNanobanana2Config.ts`**.

| Field | Type | Notes |
|-------|------|--------|
| `output_format` | `'text_and_image'` \| `'image_only'` | Default `text_and_image` → `responseModalities: ['TEXT','IMAGE']`; `image_only` → `['IMAGE']` only |
| `temperature` | number | Clamped 0–1 |
| `image_size` | `'512'` \| `'1K'` \| `'2K'` \| `'4K'` | Default `1K`; **512** only on 3.1 Flash Image |
| `grounding_web` | boolean | Adds `{ googleSearch: {} }` tool |
| `grounding_image_search` | boolean | Adds image search tool variant |
| `stop_sequences` | string[] | Max 8 |
| `max_output_tokens` | number | Capped at 65 536 |
| `top_p` | number | 0–1, step 0.05 |
| `thinking_level` | `'minimal'` \| `'low'` \| `'medium'` \| `'high'` | Omitted when studio is “default” (no thinking config sent) |

### Nanobanana Pro — `nanobanana_pro` object

Parsed by `resolveNanobananaProRequest()` — **`app/utils/geminiProNanobanana.ts`**. Fields: `system_instruction`, `temperature`, `image_size` (`1K`/`2K`/`4K`), `grounding_web`, `stop_sequences`, `max_output_tokens`, `top_p`.

### Nanobanana (2.5) — `nanobanana_25` object

Parsed by `resolveNanobanana25Request()` — **`app/utils/gemini25Nanobanana.ts`**. Fields: `system_instruction`, `temperature`, `stop_sequences`, `max_output_tokens`, `top_p`. No resolution control in API (aspect-only `imageConfig`).

---

## Shared utilities

### `app/utils/` (client + server)

| File | Purpose |
|------|---------|
| `studioImageModels.ts` | Model registry, `STUDIO_IMAGE_MODEL`, select items, icons |
| `imageApiRoutes.ts` | `modelIdToImageApiSlug()`, `postUrlForImageModel()` |
| `textApiRoutes.ts` | Enhance / Surprise URLs |
| `geminiImageUtils.ts` | `asRequestBodyRecord`, clamps, `parseStopSequences*`, aspect ratio sets, `buildGeminiImageConfig()` |
| `gemini31Nanobanana2.ts` | Nanobanana 2 defaults + `resolveNanobanana2Request()` |
| `geminiProNanobanana.ts` | Nanobanana Pro defaults + `resolveNanobananaProRequest()` |
| `gemini25Nanobanana.ts` | Nanobanana (2.5) defaults + `resolveNanobanana25Request()` |
| `openAiImagePresets.ts` | GPT Image quality/size helpers for the studio UI |

**Rule:** Parsing and clamps live in **`app/utils`** so the studio and Nitro routes never drift.

### `server/utils/` (Nitro only)

| File | Purpose |
|------|---------|
| `imageApiCommon.ts` | `readJsonBody`, `aspectRatioFromBody`, `promptFromBody`, `optionalNestedRecord`, `requireGeminiKey` / `requireOpenAiKey`, `ImageGenResult` |
| `geminiImage.ts` | `generateGeminiImageFromStream`, `dataUrlFromGeminiParts`, `rethrowGeminiImageError` |
| `geminiNanobanana2Config.ts` | `buildNanobanana2GeminiConfig()` — maps resolved options → Gemini API `config` |
| `openAiImage.ts` | `imageGenResultFromOpenAi`, `rethrowOpenAiImageError` |
| `openAiImageSize.ts` | Aspect → size for GPT 1.5, GPT 2 size/quality normalization, data URL from `b64_json` |
| `promptAssistOpenAi.ts` | Shared OpenAI chat runner for enhance / surprise |
| `promptAssistPrompts.ts` | System prompt strings |

---

## OpenAI (GPT Image)

- **`gpt-image-1.5`** — Studio **aspect** presets map to fixed API sizes (`1024×1024`, `1536×1024`, etc.). Client sends `aspect_ratio`; server maps via `openAiGptImage15SizeForAspect()` in `openAiImageSize.ts`.
- **`gpt-image-2`** — **`size`** is sent explicitly (`openai_size` from studio). Quality via `openai_quality` (`low` \| `medium` \| `high` \| `auto`).
- Uses the `openai` package: `images.generate` with `b64_json` → data URL.

---

## Google (Gemini native image)

Uses **`@google/genai`**: `GoogleGenAI` → `models.generateContentStream` (see **`server/utils/geminiImage.ts`**). The handler collects the last chunk’s **`parts`**, skips **`thought`** parts when picking the image, and returns the last **`inlineData`** as a data URL.

- **`imageConfig`** — Built with **`buildGeminiImageConfig()`** in **`app/utils/geminiImageUtils.ts`**.
  - **`gemini-2.5-flash-image`** — aspect only (empty `imageConfig` when aspect is **Auto**).
  - **Gemini 3.x image models** — add **`imageSize`** (`1K` / `2K` / `4K`; **`512`** only on **3.1 Flash Image**).
  - **Auto** aspect omits **`aspectRatio`** where supported (model default).
- **2.5 / 3 Pro routes** — `responseModalities: ['IMAGE']` only.
- **3.1 (Nanobanana 2)** — modalities and tools follow studio options (see table above).

**Model IDs:** Only **native image** Gemini models belong in the studio allowlist (`studioImageModels.ts`). Do **not** confuse text-only IDs (`gemini-3-flash-preview`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`) with **`gemini-3.1-flash-image-preview`**.

**Nano Banana** — product naming, prompting, SynthID, Thinking, limits: **[GEMINI_NANO_BANANA.md](./GEMINI_NANO_BANANA.md)**.

**Image understanding (vision)** — not implemented in stock **`/api/image/*`** routes: **[GEMINI_IMAGE_UNDERSTANDING.md](./GEMINI_IMAGE_UNDERSTANDING.md)**.

---

## Prompt helpers (OpenAI chat)

| Route | Body |
|-------|------|
| `POST /api/text/enhance-prompt` | `{ "prompt": "…" }` |
| `POST /api/text/surprise-prompt` | empty |

Both require **`OPENAI_API_KEY`**. Model from `openaiPromptModel` in runtime config (default **`gpt-4o-mini`**; override with **`OPENAI_PROMPT_MODEL`**). Implementation: **`server/utils/promptAssistOpenAi.ts`** + **`promptAssistPrompts.ts`**.

---

## HTTP status codes

| Code | When |
|------|------|
| **400** | Missing or empty `prompt` |
| **503** | API key missing for the selected provider |
| **502** | Vendor error or no image in Gemini stream / OpenAI response |

---

## Extending

1. Add the model to **`studioImageModels.ts`** and **`imageApiRoutes.ts`**.
2. Add **`resolve*Request()`** (and defaults) under **`app/utils/`** if the model has studio controls.
3. Add **`server/api/image/<slug>.post.ts`** using `readJsonBody`, provider helpers, and the same response shape.
4. For Gemini, prefer **`generateGeminiImageFromStream`** + **`rethrowGeminiImageError`**.

Reference forks: `screenlify/server/api/ai/openai-image.post.ts`, `google-gemini-image.post.ts` — batching, NDJSON streaming, reference images, Imagen `generateImages`.

**Streaming (optional):** For NDJSON like Screenlify’s studio, add `stream: true` in a separate route or extend a handler; not included in the stock template.
