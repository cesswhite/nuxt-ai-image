# Image pipeline

Image generation is split **one HTTP route per studio model** under **`/api/image/*`**. Shared logic lives in **`server/utils/generateImageShared.ts`**. URL slugs use **hyphens** instead of dots in Google model IDs (e.g. `gemini-3.1-…` → `gemini-3-1-…`). The client maps canonical model IDs to paths via **`app/utils/imageApiRoutes.ts`** (`postUrlForImageModel`). Allowed model IDs remain in **`app/utils/studioImageModels.ts`**.

## Contract — `POST /api/image/…`

| Route | Model ID | Body |
|-------|----------|------|
| `POST /api/image/gpt-image-1-5` | `gpt-image-1.5` | `prompt` (required), `aspect_ratio?`, `openai_quality?` |
| `POST /api/image/gpt-image-2` | `gpt-image-2` | `prompt` (required), `openai_size?`, `openai_quality?` |
| `POST /api/image/gemini-3-1-flash-image-preview` | `gemini-3.1-flash-image-preview` | `prompt`, `aspect_ratio?`, `nanobanana2?` — see `app/utils/gemini31Nanobanana2.ts` |
| `POST /api/image/gemini-3-pro-image-preview` | `gemini-3-pro-image-preview` | `prompt`, `aspect_ratio?`, `nanobanana_pro?` — see `app/utils/geminiProNanobanana.ts` |
| `POST /api/image/gemini-2-5-flash-image` | `gemini-2.5-flash-image` | `prompt`, `aspect_ratio?`, `nanobanana_25?` — see `app/utils/gemini25Nanobanana.ts` |

**Response** (same shape for every route):

```json
{
  "output": "data:image/png;base64,...",
  "provider": "openai",
  "model": "gpt-image-1.5"
}
```

Return value is a **data URL** the client can use in `<img src>`.

## OpenAI (GPT Image)

- **`gpt-image-1.5`** — four **aspect** presets map to fixed API sizes (`1024×1024`, `1536×1024`, `1792×1024`, `1024×1792`). Client sends `aspect_ratio`; the server maps to `size`.
- **`gpt-image-2`** — **`size`** is sent explicitly (popular resolutions from the [image generation guide](https://developers.openai.com/api/docs/guides/image-generation), including `auto`, 1K/2K/4K presets). Pass `openai_size` from the studio; arbitrary valid `WxH` could be added later.
- **`quality`** (`low` | `medium` | `high` | `auto`) is sent for both GPT Image models when `provider` is OpenAI (`openai_quality`).

Uses the `openai` package: `images.generate` with `b64_json` → data URL.

## Google (Gemini native image)

Uses `@google/genai`: `GoogleGenAI` → `models.generateContent` with `responseModalities: ['TEXT', 'IMAGE']` and `imageConfig` from **`buildGeminiImageConfig()`** in `app/utils/geminiAspectRatios.ts`: **`gemini-2.5-flash-image`** sends **aspect ratio only** (or **{}** when aspect is **Auto**); **Gemini 3.x** image models add **`imageSize: '1K'`**; **Nanobanana 2** / **Pro** / **Nanobanana** with **Auto** omit **`aspectRatio`** (model default).

**Model IDs:** Only **native image** Gemini models belong in the studio allowlist (`app/utils/studioImageModels.ts`). **Do not confuse** text-oriented Gemini 3 IDs with image models: **`gemini-3-flash-preview`**, **`gemini-3.1-pro-preview`**, **`gemini-3.1-flash-lite`** (text output; image generation not supported — [Gemini 3 guide](https://ai.google.dev/gemini-api/docs/gemini-3)). **`gemini-3.1-flash-lite`** is especially easy to mix up with **`gemini-3.1-flash-image-preview`**. These handlers use **`gemini-3.1-flash-image-preview`**, **`gemini-3-pro-image-preview`**, **`gemini-2.5-flash-image`**, etc.

**Nano Banana (product naming), prompting, resolutions, Thinking, SynthID, and limits** — see **[GEMINI_NANO_BANANA.md](./GEMINI_NANO_BANANA.md)** (summary of [Google’s image generation guide](https://ai.google.dev/gemini-api/docs/image-generation)).

**Image understanding (vision)** — Captioning, VQA, multi-image comparison, object detection, `media_resolution`, inline vs File API, token/tile rules: **[GEMINI_IMAGE_UNDERSTANDING.md](./GEMINI_IMAGE_UNDERSTANDING.md)** (summary of [Google’s image understanding guide](https://ai.google.dev/gemini-api/docs/image-understanding)). Not implemented in the stock **`/api/image/*`** image-generation routes.

## Prompt helpers (OpenAI chat)

Studio **Enhance prompt** → `POST /api/text/enhance-prompt` with `{ "prompt": "…" }`. **Surprise me** → `POST /api/text/surprise-prompt` (empty body). Both require `OPENAI_API_KEY` and use `openaiPromptModel` from runtime config (default **`gpt-4o-mini`**; set `OPENAI_PROMPT_MODEL` to override). Implementation: `server/utils/promptAssistOpenAi.ts`.

## Extending

Reference: `screenlify/server/api/ai/openai-image.post.ts`, `screenlify/server/api/ai/google-gemini-image.post.ts` — batching, streaming NDJSON, reference images, Imagen `generateImages`.

## Streaming (optional)

For NDJSON streaming like Screenlify’s studio, add `stream: true` handling in a **separate** route or extend this one.
