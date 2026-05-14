/**
 * Minimal shared pieces for `/api/image/*` routes (avoid a central “god” generator module).
 */
import { createError } from 'h3'

export interface ImageGenResult {
  output: string
  provider: 'openai' | 'google-gemini'
  model: string
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

export function asNestedRecord(val: unknown): Record<string, unknown> | undefined {
  if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>
  }
  return undefined
}
