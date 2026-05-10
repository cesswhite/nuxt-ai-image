/**
 * Aspect ratios for Gemini native image generation (`imageConfig.aspectRatio`).
 * Sources: [Image generation](https://ai.google.dev/gemini-api/docs/image-generation),
 * Google AI Studio UI for **Nanobanana** / **Nanobanana 2** / **Pro** (native image models).
 *
 * **Auto** is a UI/API convention: omit `aspectRatio` in `imageConfig` (model default).
 * Supported for **`gemini-2.5-flash-image`**, **`gemini-3.1-flash-image-preview`**, **`gemini-3-pro-image-preview`**.
 */

/**
 * `gemini-2.5-flash-image` (Nanobanana) — AI Studio order; **`auto`** omits `aspectRatio`.
 * No 1:4 / 4:1 / 8:1 / 1:8 (those are 3.1 Flash Image only).
 */
export const GEMINI_25_FLASH_IMAGE_ASPECT_RATIOS = [
  'auto',
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
] as const

/**
 * `gemini-3-pro-image-preview` (Nanobanana Pro) — AI Studio order; no 1:4 / 4:1 / 8:1 / 1:8.
 * **`auto`** omits `aspectRatio` in the API (same as Studio).
 */
export const GEMINI_3_PRO_IMAGE_ASPECT_RATIOS = [
  'auto',
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
] as const

/**
 * `gemini-3.1-flash-image-preview` (Nanobanana 2) — Studio order + full extended set.
 * First value `auto` maps to omitting `aspectRatio` in the API request.
 */
export const GEMINI_31_FLASH_IMAGE_ASPECT_RATIOS = [
  'auto',
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
  '4:1',
  '1:4',
  '8:1',
  '1:8',
] as const

export type Gemini25AspectRatio = (typeof GEMINI_25_FLASH_IMAGE_ASPECT_RATIOS)[number]
export type Gemini3ProAspectRatio = (typeof GEMINI_3_PRO_IMAGE_ASPECT_RATIOS)[number]
export type Gemini31AspectRatio = (typeof GEMINI_31_FLASH_IMAGE_ASPECT_RATIOS)[number]

export function allowedGeminiAspectRatiosForModel(model: string): readonly string[] {
  switch (model) {
    case 'gemini-2.5-flash-image':
      return GEMINI_25_FLASH_IMAGE_ASPECT_RATIOS
    case 'gemini-3-pro-image-preview':
      return GEMINI_3_PRO_IMAGE_ASPECT_RATIOS
    case 'gemini-3.1-flash-image-preview':
      return GEMINI_31_FLASH_IMAGE_ASPECT_RATIOS
    default:
      return GEMINI_25_FLASH_IMAGE_ASPECT_RATIOS
  }
}

export function isAllowedGeminiAspectForModel(model: string, aspect: string): boolean {
  const allowed = allowedGeminiAspectRatiosForModel(model)
  return (allowed as readonly string[]).includes(aspect)
}

/** Normalize user/API input: unknown values fall back to `1:1` (`auto` only when allowed for the model). */
export function normalizeGeminiAspectRatio(model: string, aspect: string): string {
  const a = aspect.trim()
  if (isAllowedGeminiAspectForModel(model, a)) return a
  return '1:1'
}

/** USelect items; `auto` is labeled "Auto". */
export function geminiAspectSelectItemsForModel(model: string): { label: string, value: string }[] {
  return allowedGeminiAspectRatiosForModel(model).map((v) => ({
    label: v === 'auto' ? 'Auto' : v,
    value: v,
  }))
}

/** Optional Gemini 3.x output resolution (`imageConfig.imageSize`); `512` only for 3.1 Flash Image. */
export interface BuildGeminiImageConfigOptions {
  gemini3ImageSize?: string
}

/**
 * Build `imageConfig` for `generateContent`. Gemini 2.5: aspect only.
 * Gemini 3.x image: optional `imageSize` (`512` / `1K` / `2K` / `4K`; **512** = 3.1 Flash only) + optional `aspectRatio`; **Auto** omits `aspectRatio`.
 */
export function buildGeminiImageConfig(
  model: string,
  aspectRatio: string,
  options?: BuildGeminiImageConfigOptions,
): { aspectRatio?: string, imageSize?: string } {
  const is25 = model === 'gemini-2.5-flash-image'
  const resolved = normalizeGeminiAspectRatio(model, aspectRatio)
  const size3 = normalizeGemini3ImageSize(model, options?.gemini3ImageSize)

  if (is25) {
    if (resolved === 'auto') return {}
    return { aspectRatio: resolved }
  }

  if (
    resolved === 'auto'
    && (model === 'gemini-3.1-flash-image-preview' || model === 'gemini-3-pro-image-preview')
  ) {
    return { imageSize: size3 }
  }

  return { aspectRatio: resolved, imageSize: size3 }
}

function normalizeGemini3ImageSize(model: string, raw?: string): string {
  const s = (raw ?? '1K').trim()
  if (model === 'gemini-3.1-flash-image-preview') {
    if (s === '512' || s === '1K' || s === '2K' || s === '4K') return s
    return '1K'
  }
  if (model === 'gemini-3-pro-image-preview') {
    if (s === '1K' || s === '2K' || s === '4K') return s
    return '1K'
  }
  return '1K'
}
