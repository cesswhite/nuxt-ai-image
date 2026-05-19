import { parseImageDataUrl } from '~/utils/studioImageOutput'
import { STUDIO_IMAGE_MODEL, type StudioImageModelId } from '~/utils/studioImageModels'

/** Per-image inline limit (Gemini API; keep conservative for browser uploads). */
export const STUDIO_REFERENCE_IMAGE_MAX_BYTES = 7 * 1024 * 1024

const REFERENCE_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/heic,image/heif'

/**
 * Max reference images per model (Gemini native image generation).
 * @see docs/GEMINI_NANO_BANANA.md — 2.5 ≈3 recommended; 3.x up to 14.
 */
export const REFERENCE_IMAGE_LIMIT_BY_MODEL: Record<StudioImageModelId, number> = {
  [STUDIO_IMAGE_MODEL.NANOBANANA2]: 14,
  [STUDIO_IMAGE_MODEL.NANOBANANA_PRO]: 14,
  [STUDIO_IMAGE_MODEL.NANOBANANA_25]: 3,
  [STUDIO_IMAGE_MODEL.GPT_IMAGE_15]: 0,
  [STUDIO_IMAGE_MODEL.GPT_IMAGE_2]: 0,
}

export function maxReferenceImagesForModel(modelId: string): number {
  return REFERENCE_IMAGE_LIMIT_BY_MODEL[modelId as StudioImageModelId] ?? 0
}

export function supportsReferenceImages(modelId: string): boolean {
  return maxReferenceImagesForModel(modelId) > 0
}

export function referenceImageAcceptAttribute(): string {
  return REFERENCE_IMAGE_ACCEPT
}

export function validateReferenceDataUrl(
  dataUrl: string,
  maxBytes = STUDIO_REFERENCE_IMAGE_MAX_BYTES,
): { ok: true } | { ok: false, error: string } {
  const trimmed = dataUrl.trim()
  if (!trimmed.startsWith('data:image/')) {
    return { ok: false, error: 'Image must be PNG, JPEG, or WebP.' }
  }
  const parsed = parseImageDataUrl(trimmed)
  if (!parsed) {
    return { ok: false, error: 'Invalid image data.' }
  }
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
  if (!allowed.includes(parsed.mimeType.toLowerCase())) {
    return { ok: false, error: 'Unsupported image type.' }
  }
  const byteLength = Math.floor((parsed.data.length * 3) / 4)
  if (byteLength > maxBytes) {
    return { ok: false, error: `Image exceeds ${Math.round(maxBytes / (1024 * 1024))}MB.` }
  }
  return { ok: true }
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image file.'))
    }
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })
}

export function trimReferenceImagesForModel(
  urls: string[],
  modelId: string,
): string[] {
  const max = maxReferenceImagesForModel(modelId)
  return urls.slice(0, max)
}
