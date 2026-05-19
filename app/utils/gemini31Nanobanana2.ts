/**
 * Nanobanana 2 (`gemini-3.1-flash-image-preview`) — parity with Google AI Studio controls.
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */

import {
  asRequestBodyRecord,
  clampStudioMaxOutputTokens,
  clampStudioTemperature,
  clampStudioTopP,
  parseStopSequencesField,
  STUDIO_TOP_P_STEP,
} from '~/utils/geminiImageUtils'

export type Nanobanana2OutputFormat = 'text_and_image' | 'image_only'

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
  include_thoughts?: boolean
}

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

export { STUDIO_TOP_P_STEP }

export function normalizeNanobanana2ImageSize(raw: string | undefined): Nanobanana2ImageSize {
  const s = (raw ?? '1K').trim()
  if ((NANOBANANA2_IMAGE_SIZES as readonly string[]).includes(s)) return s as Nanobanana2ImageSize
  return '1K'
}

function parseNanobanana2ThinkingLevel(raw: unknown): Nanobanana2ThinkingLevel | undefined {
  if (typeof raw !== 'string') return undefined
  const s = raw.trim().toLowerCase()
  return (NANOBANANA2_THINKING_LEVELS as readonly string[]).includes(s)
    ? (s as Nanobanana2ThinkingLevel)
    : undefined
}

export function resolveNanobanana2Request(raw: unknown): Nanobanana2RequestOptions {
  const o = asRequestBodyRecord(raw)

  const fmt = o.output_format
  const output_format
    = fmt === 'image_only' || fmt === 'text_and_image'
      ? fmt
      : NANOBANANA2_DEFAULTS.outputFormat

  return {
    output_format,
    temperature: clampStudioTemperature(
      typeof o.temperature === 'number' ? o.temperature : undefined,
      NANOBANANA2_DEFAULTS.temperature,
    ),
    image_size: normalizeNanobanana2ImageSize(
      typeof o.image_size === 'string' ? o.image_size : undefined,
    ),
    grounding_web: Boolean(o.grounding_web),
    grounding_image_search: Boolean(o.grounding_image_search),
    stop_sequences: parseStopSequencesField(o.stop_sequences),
    max_output_tokens: clampStudioMaxOutputTokens(
      typeof o.max_output_tokens === 'number' ? o.max_output_tokens : undefined,
      NANOBANANA2_DEFAULTS.maxOutputTokens,
    ),
    top_p: clampStudioTopP(
      typeof o.top_p === 'number' ? o.top_p : undefined,
      NANOBANANA2_DEFAULTS.topP,
    ),
    thinking_level: parseNanobanana2ThinkingLevel(o.thinking_level),
    include_thoughts: typeof o.include_thoughts === 'boolean' ? o.include_thoughts : undefined,
  }
}
