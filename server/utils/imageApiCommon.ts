/**
 * Shared pieces for `/api/image/*` and related routes.
 */
import { createError, readBody, type H3Event } from 'h3'
import type { StudioProvider } from '~/types/studio'
import { asRequestBodyRecord } from '~/utils/geminiImageUtils'

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
