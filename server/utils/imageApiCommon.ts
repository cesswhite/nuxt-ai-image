/**
 * Shared pieces for `/api/image/*` and related routes.
 */
import { createError, readBody, type H3Event } from 'h3'
import type { StudioProvider } from '~/types/studio'
import { asRequestBodyRecord } from '~/utils/geminiImageUtils'
import {
  maxReferenceImagesForModel,
  trimReferenceImagesForModel,
  validateReferenceDataUrl,
} from '~/utils/studioReferenceImages'

export interface ImageGenResult {
  output: string
  provider: StudioProvider
  model: string
}

export async function readJsonBody(event: H3Event): Promise<Record<string, unknown>> {
  const raw = await readBody(event).catch(() => ({}))
  return asRequestBodyRecord(raw)
}

/** Nested POST section (e.g. `nanobanana_pro`); `undefined` when absent or not an object. */
export function optionalNestedRecord(val: unknown): Record<string, unknown> | undefined {
  if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>
  }
  return undefined
}

export function aspectRatioFromBody(
  body: Record<string, unknown>,
  fallback: string,
): string {
  return typeof body.aspect_ratio === 'string' && body.aspect_ratio.trim()
    ? body.aspect_ratio.trim()
    : fallback
}

/** Optional reference images for Gemini (`reference_image_data_urls` or legacy single field). */
export function referenceImageDataUrlsFromBody(
  body: Record<string, unknown>,
  modelId: string,
): string[] {
  const max = maxReferenceImagesForModel(modelId)
  if (max === 0) return []

  const collected: string[] = []

  const legacy = body.reference_image_data_url
  if (typeof legacy === 'string' && legacy.trim().startsWith('data:image/')) {
    collected.push(legacy.trim())
  }

  const raw = body.reference_image_data_urls
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && item.trim().startsWith('data:image/')) {
        collected.push(item.trim())
      }
    }
  }

  const unique = [...new Set(collected)]
  const trimmed = trimReferenceImagesForModel(unique, modelId)

  for (const url of trimmed) {
    const check = validateReferenceDataUrl(url)
    if (!check.ok) {
      throw createError({ statusCode: 400, message: check.error })
    }
  }

  return trimmed
}

export function requireGeminiKey(config: { geminiApiKey?: string }) {
  const hasGemini = Boolean(config.geminiApiKey && String(config.geminiApiKey).trim())
  if (!hasGemini) {
    throw createError({
      statusCode: 503,
      message:
        'Gemini is selected but GEMINI_API_KEY (or GOOGLE_API_KEY / NUXT_GEMINI_API_KEY) is not set. Add it to .env.',
    })
  }
}

export function requireOpenAiKey(config: { openaiApiKey?: string }) {
  const hasOpenAI = Boolean(config.openaiApiKey && String(config.openaiApiKey).trim())
  if (!hasOpenAI) {
    throw createError({
      statusCode: 503,
      message: 'OpenAI is selected but OPENAI_API_KEY is not set. Add it to .env.',
    })
  }
}

export function promptFromBody(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : ''
}
