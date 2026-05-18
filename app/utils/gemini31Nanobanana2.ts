/**
 * Nanobanana 2 (`gemini-3.1-flash-image-preview`) — parity with Google AI Studio controls.
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */

export type Nanobanana2OutputFormat = 'text_and_image' | 'image_only'

/** Maps to Gemini `thinkingConfig.thinkingLevel` when set (model must support thinking). */
export const NANOBANANA2_THINKING_LEVELS = ['minimal', 'low', 'medium', 'high'] as const
export type Nanobanana2ThinkingLevel = (typeof NANOBANANA2_THINKING_LEVELS)[number]

export const NANOBANANA2_IMAGE_SIZES = ['512', '1K', '2K', '4K'] as const
export type Nanobanana2ImageSize = (typeof NANOBANANA2_IMAGE_SIZES)[number]

export interface Nanobanana2RequestOptions {
  output_format?: Nanobanana2OutputFormat
  temperature?: number
  image_size?: Nanobanana2ImageSize | string
  grounding_web?: boolean
  grounding_image_search?: boolean
  stop_sequences?: string[]
  max_output_tokens?: number
  top_p?: number
  thinking_level?: Nanobanana2ThinkingLevel
  /** When true/false, sets `thinkingConfig.includeThoughts` (API returns thought parts if supported). */
  include_thoughts?: boolean
}

/** Default studio / API defaults (aligned with typical AI Studio snapshot). */
export const NANOBANANA2_DEFAULTS = {
  outputFormat: 'text_and_image' as Nanobanana2OutputFormat,
  temperature: 1,
  imageSize: '1K' as Nanobanana2ImageSize,
  groundingWeb: false,
  groundingImageSearch: false,
  stopSequencesRaw: '',
  maxOutputTokens: 65_536,
  topP: 0.95,
} as const

export function parseStopSequencesFromRaw(raw: string): string[] | undefined {
  const parts = raw
    .split(/[\n,|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return undefined
  return parts.slice(0, 8)
}

export function normalizeNanobanana2ImageSize(raw: string | undefined): Nanobanana2ImageSize {
  const s = (raw ?? '1K').trim()
  if ((NANOBANANA2_IMAGE_SIZES as readonly string[]).includes(s)) return s as Nanobanana2ImageSize
  return '1K'
}

export function clampNanobanana2Temperature(n: number | undefined): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return NANOBANANA2_DEFAULTS.temperature
  return Math.min(1, Math.max(0, n))
}

/** Top P slider: 0–1 in steps of 0.05 (AI Studio–style granularity). */
export const NANOBANANA2_TOP_P_STEP = 0.05

export function clampNanobanana2TopP(n: number | undefined): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return NANOBANANA2_DEFAULTS.topP
  const clamped = Math.min(1, Math.max(0, n))
  return Math.round(clamped / NANOBANANA2_TOP_P_STEP) * NANOBANANA2_TOP_P_STEP
}

export function clampNanobanana2MaxOutputTokens(n: number | undefined): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return NANOBANANA2_DEFAULTS.maxOutputTokens
  return Math.min(65_536, Math.max(1, Math.floor(n)))
}

function parseNanobanana2ThinkingLevel(raw: unknown): Nanobanana2ThinkingLevel | undefined {
  if (typeof raw !== 'string') return undefined
  const s = raw.trim().toLowerCase()
  return (NANOBANANA2_THINKING_LEVELS as readonly string[]).includes(s)
    ? (s as Nanobanana2ThinkingLevel)
    : undefined
}

/** Parse flat POST fields for `gemini-3.1-flash-image-preview`. */
export function resolveNanobanana2Request(raw: unknown): Nanobanana2RequestOptions {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const stopRaw = o.stop_sequences
  let stop_sequences: string[] | undefined
  if (Array.isArray(stopRaw)) {
    const arr = stopRaw
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8)
    stop_sequences = arr.length ? arr : undefined
  }

  const fmt = o.output_format
  const output_format
    = fmt === 'image_only' || fmt === 'text_and_image'
      ? fmt
      : NANOBANANA2_DEFAULTS.outputFormat

  return {
    output_format,
    temperature: clampNanobanana2Temperature(
      typeof o.temperature === 'number' ? o.temperature : undefined,
    ),
    image_size: normalizeNanobanana2ImageSize(
      typeof o.image_size === 'string' ? o.image_size : undefined,
    ),
    grounding_web: Boolean(o.grounding_web),
    grounding_image_search: Boolean(o.grounding_image_search),
    stop_sequences,
    max_output_tokens: clampNanobanana2MaxOutputTokens(
      typeof o.max_output_tokens === 'number' ? o.max_output_tokens : undefined,
    ),
    top_p: clampNanobanana2TopP(typeof o.top_p === 'number' ? o.top_p : undefined),
    thinking_level: parseNanobanana2ThinkingLevel(o.thinking_level),
    include_thoughts: typeof o.include_thoughts === 'boolean' ? o.include_thoughts : undefined,
  }
}
