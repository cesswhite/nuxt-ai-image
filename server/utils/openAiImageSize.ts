import {
  GPT_IMAGE_2_SIZE_VALUES,
  type OpenAiImageQuality,
} from '~/utils/openAiImagePresets'

/**
 * Map aspect ratio to GPT Image 1.5 `size` (fixed presets from Image API).
 * @see OpenAI Image API — sizes for GPT Image models prior to gpt-image-2
 */
export function openAiGptImage15SizeForAspect(
  aspectRatio: string,
): '1024x1024' | '1536x1024' | '1792x1024' | '1024x1792' {
  switch (aspectRatio.trim()) {
    case '4:3':
      return '1536x1024'
    case '16:9':
      return '1792x1024'
    case '9:16':
      return '1024x1792'
    case '1:1':
    default:
      return '1024x1024'
  }
}

export function normalizeGptImage2Size(raw: string | undefined): string {
  const s = (raw ?? '').trim()
  if (s && GPT_IMAGE_2_SIZE_VALUES.has(s)) return s
  return '1024x1024'
}

const QUALITY_SET = new Set<OpenAiImageQuality>(['low', 'medium', 'high', 'auto'])

export function normalizeOpenAiQuality(raw: string | undefined): OpenAiImageQuality {
  const q = (raw ?? 'auto').trim().toLowerCase()
  if (QUALITY_SET.has(q as OpenAiImageQuality)) return q as OpenAiImageQuality
  return 'auto'
}

function b64ToDataUrl(b64: string, format: 'png' | 'jpeg' | 'webp' | undefined): string {
  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
  return `data:${mime};base64,${b64}`
}

export function dataUrlFromOpenAiResult(
  b64: string | undefined,
  outputFormat: 'png' | 'jpeg' | 'webp' | undefined,
): string {
  if (!b64) {
    throw new Error('No b64_json in OpenAI image response.')
  }
  return b64ToDataUrl(b64, outputFormat)
}
