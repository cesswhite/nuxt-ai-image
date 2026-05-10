/**
 * Allowed image model IDs per provider for studio / **`POST /api/image/*`** routes.
 *
 * **Google Gemini — use native image models only.** This route calls `generateContent` with
 * image output (`responseModalities: ['TEXT', 'IMAGE']`). Do **not** use general Gemini 3 **text**
 * models here — e.g. **`gemini-3-flash-preview`**, **`gemini-3.1-pro-preview`**, **`gemini-3.1-flash-lite`**
 * (outputs text; image generation not supported — see
 * [Gemini models](https://ai.google.dev/gemini-api/docs/models/gemini)). **`gemini-3.1-flash-lite`**
 * is easy to confuse with **`gemini-3.1-flash-image-preview`** (“-lite” vs “-flash-image-”).
 * Image-capable IDs use `…-image…` / `…-flash-image` (e.g. `gemini-2.5-flash-image`).
 *
 * Keep in sync with `server/api/image/*.post.ts`, `server/utils/generateImageShared.ts`, and `app/utils/geminiAspectRatios.ts`.
 */
export const OPENAI_IMAGE_MODEL_IDS = ['gpt-image-1.5', 'gpt-image-2'] as const

export const GEMINI_IMAGE_MODEL_IDS = [
  /** Nanobanana 2 — Gemini 3.1 Flash Image Preview. Not `gemini-3.1-flash-lite` (text). */
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
] as const

export type OpenAIImageModelId = (typeof OPENAI_IMAGE_MODEL_IDS)[number]
export type GeminiImageModelId = (typeof GEMINI_IMAGE_MODEL_IDS)[number]

/** UI labels (aliases); API still uses the model IDs as `value`. */
export const STUDIO_IMAGE_MODEL_LABELS: Record<string, string> = {
  'gpt-image-1.5': 'GPT Image 1.5',
  'gpt-image-2': 'GPT Image 2',
  'gemini-2.5-flash-image': 'Nanobanana',
  'gemini-3-pro-image-preview': 'Nanobanana Pro',
  'gemini-3.1-flash-image-preview': 'Nanobanana 2',
}

export function studioModelSelectItems(
  ids: readonly string[],
): { label: string, value: string }[] {
  return ids.map((id) => ({
    value: id,
    label: STUDIO_IMAGE_MODEL_LABELS[id] ?? id,
  }))
}

export function defaultModelForProvider(provider: 'openai' | 'google-gemini'): string {
  return provider === 'openai' ? 'gpt-image-1.5' : 'gemini-3.1-flash-image-preview'
}

export function isAllowedStudioModel(
  provider: 'openai' | 'google-gemini',
  model: string,
): boolean {
  const id = model.trim()
  if (provider === 'openai') {
    return (OPENAI_IMAGE_MODEL_IDS as readonly string[]).includes(id)
  }
  return (GEMINI_IMAGE_MODEL_IDS as readonly string[]).includes(id)
}
