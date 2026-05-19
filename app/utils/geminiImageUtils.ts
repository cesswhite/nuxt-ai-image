/**
 * Shared Gemini image studio helpers: clamps, parsing, aspect ratios, imageConfig.
 * Model-specific POST bodies stay in `gemini31Nanobanana2.ts`, `geminiProNanobanana.ts`, `gemini25Nanobanana.ts`.
 */

import { STUDIO_IMAGE_MODEL } from '~/utils/studioImageModels'

// --- Generation params (clamps, stop sequences) ---

export const STUDIO_TOP_P_STEP = 0.05

const MAX_OUTPUT_TOKENS_CAP = 65_536

export function asRequestBodyRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {}
}

/** Client: split raw string from the studio stop-sequence field. */
export function parseStopSequencesFromRaw(raw: string): string[] | undefined {
  const parts = raw
    .split(/[\n,|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return undefined
  return parts.slice(0, 8)
}

/** Server: `stop_sequences` array on the POST body. */
export function parseStopSequencesField(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const arr = raw
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8)
  return arr.length ? arr : undefined
}

export function parseOptionalSystemInstruction(raw: unknown): string | undefined {
  const sys = typeof raw === 'string' ? raw.trim() : ''
  return sys.length > 0 ? sys : undefined
}

export function clampStudioTemperature(
  n: number | undefined,
  fallback = 1,
): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback
  return Math.min(1, Math.max(0, n))
}

export function clampStudioTopP(n: number | undefined, fallback = 0.95): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback
  const clamped = Math.min(1, Math.max(0, n))
  return Math.round(clamped / STUDIO_TOP_P_STEP) * STUDIO_TOP_P_STEP
}

export function clampStudioMaxOutputTokens(
  n: number | undefined,
  fallback = 32_768,
): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback
  return Math.min(MAX_OUTPUT_TOKENS_CAP, Math.max(1, Math.floor(n)))
}

// --- Aspect ratios & imageConfig ---

/** Nanobanana (2.5) and Pro — `auto` omits `aspectRatio` in the API. */
export const GEMINI_STANDARD_IMAGE_ASPECT_RATIOS = [
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

/** Nanobanana 2 — extended aspect set. */
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

export type GeminiStandardAspectRatio = (typeof GEMINI_STANDARD_IMAGE_ASPECT_RATIOS)[number]
export type Gemini31AspectRatio = (typeof GEMINI_31_FLASH_IMAGE_ASPECT_RATIOS)[number]

const ASPECT_SET_BY_MODEL: Record<string, ReadonlySet<string>> = {
  [STUDIO_IMAGE_MODEL.NANOBANANA_25]: new Set(GEMINI_STANDARD_IMAGE_ASPECT_RATIOS),
  [STUDIO_IMAGE_MODEL.NANOBANANA_PRO]: new Set(GEMINI_STANDARD_IMAGE_ASPECT_RATIOS),
  [STUDIO_IMAGE_MODEL.NANOBANANA2]: new Set(GEMINI_31_FLASH_IMAGE_ASPECT_RATIOS),
}

const FALLBACK_ASPECT_SET = ASPECT_SET_BY_MODEL[STUDIO_IMAGE_MODEL.NANOBANANA_25]!

export function allowedGeminiAspectRatiosForModel(model: string): readonly string[] {
  switch (model) {
    case STUDIO_IMAGE_MODEL.NANOBANANA2:
      return GEMINI_31_FLASH_IMAGE_ASPECT_RATIOS
    case STUDIO_IMAGE_MODEL.NANOBANANA_25:
    case STUDIO_IMAGE_MODEL.NANOBANANA_PRO:
    default:
      return GEMINI_STANDARD_IMAGE_ASPECT_RATIOS
  }
}

export function isAllowedGeminiAspectForModel(model: string, aspect: string): boolean {
  const set = ASPECT_SET_BY_MODEL[model] ?? FALLBACK_ASPECT_SET
  return set.has(aspect)
}

export function normalizeGeminiAspectRatio(model: string, aspect: string): string {
  const a = aspect.trim()
  if (isAllowedGeminiAspectForModel(model, a)) return a
  const set = ASPECT_SET_BY_MODEL[model] ?? FALLBACK_ASPECT_SET
  return set.has('auto') ? 'auto' : '1:1'
}

export function geminiAspectSelectItemsForModel(model: string): { label: string, value: string }[] {
  return allowedGeminiAspectRatiosForModel(model).map((v) => ({
    label: v === 'auto' ? 'Auto' : v,
    value: v,
  }))
}

export interface BuildGeminiImageConfigOptions {
  gemini3ImageSize?: string
}

export function buildGeminiImageConfig(
  model: string,
  aspectRatio: string,
  options?: BuildGeminiImageConfigOptions,
): { aspectRatio?: string, imageSize?: string } {
  const is25 = model === STUDIO_IMAGE_MODEL.NANOBANANA_25
  const resolved = normalizeGeminiAspectRatio(model, aspectRatio)
  const size3 = normalizeGemini3ImageSize(model, options?.gemini3ImageSize)

  if (is25) {
    if (resolved === 'auto') return {}
    return { aspectRatio: resolved }
  }

  if (
    resolved === 'auto'
    && (model === STUDIO_IMAGE_MODEL.NANOBANANA2 || model === STUDIO_IMAGE_MODEL.NANOBANANA_PRO)
  ) {
    return { imageSize: size3 }
  }

  return { aspectRatio: resolved, imageSize: size3 }
}

function normalizeGemini3ImageSize(model: string, raw?: string): string {
  const s = (raw ?? '1K').trim()
  if (model === STUDIO_IMAGE_MODEL.NANOBANANA2) {
    if (s === '512' || s === '1K' || s === '2K' || s === '4K') return s
    return '1K'
  }
  if (model === STUDIO_IMAGE_MODEL.NANOBANANA_PRO) {
    if (s === '1K' || s === '2K' || s === '4K') return s
    return '1K'
  }
  return '1K'
}
