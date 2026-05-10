# Image pipeline (implementing real generation)

The stock handler only runs **demo mode** or returns **501** when keys exist but code is not wired. Use this as a map when porting patterns from **screenlify** or **nananuxt**.

## Contract

`POST /api/generate-image` body:

| Field | Type | Notes |
|-------|------|--------|
| `prompt` | string | Required |
| `provider` | `"openai"` \| `"google-gemini"` | Default: google-gemini |
| `model` | string | Map to real model IDs in your implementation |
| `aspect_ratio` | string | e.g. `1:1`, `16:9` |

Response:

```json
{
  "output": "data:image/...;base64,...",
  "provider": "openai",
  "model": "gpt-image-1",
  "demo": true
}
```

Return a **data URL** or an **https URL** the client can put in `<img src>`.

## OpenAI (GPT Image)

Reference: `screenlify/server/api/ai/openai-image.post.ts` — uses `openai` package, `openai.images.generate`, `b64_json` → data URL. For edits with reference images, use `images.edit` and route selection like `screenlify/app/utils/ai-generate.ts` (`openai-image` vs `openai-image-edit`).

Add dependency: `openai` (server-side only).

## Google (Gemini / Imagen)

Reference: `screenlify/server/api/ai/google-gemini-image.post.ts` or `nananuxt/server/api/nanobanana-gemini.post.ts` — Google Gen AI SDK, `generateContent` with image modalities or Imagen `generateImages` depending on model.

Add dependency: `@google/genai` (or the package version your vendor docs specify).

## Replicate (nananuxt-style)

`nananuxt/server/api/nanobanana.ts` calls Replicate models (`google/nano-banana`, etc.). You can add a third `provider` in the template once the client and store expose it.

## Streaming (optional)

For NDJSON streaming like Screenlify’s studio, add `stream: true` handling in a **separate** route or extend this one — keep the template simple until you need it.
