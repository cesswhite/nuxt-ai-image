/**
 * Nanobanana Pro (`gemini-3-pro-image-preview`) — parity with Google AI Studio run settings.
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */

import {
  asRequestBodyRecord,
  clampStudioMaxOutputTokens,
  clampStudioTemperature,
  clampStudioTopP,
  parseOptionalSystemInstruction,
  parseStopSequencesField,
} from '~/utils/geminiImageUtils'

export const NANOBANANA_PRO_IMAGE_SIZES = ['1K', '2K', '4K'] as const
export type NanobananaProImageSize = (typeof NANOBANANA_PRO_IMAGE_SIZES)[number]

export interface NanobananaProRequestOptions {
  temperature?: number
  image_size?: NanobananaProImageSize | string
  grounding_web?: boolean
  stop_sequences?: string[]
  max_output_tokens?: number
  top_p?: number
  system_instruction?: string
}

export const NANOBANANA_PRO_DEFAULTS = {
  temperature: 1,
  imageSize: '1K' as NanobananaProImageSize,
  groundingWeb: false,
  stopSequencesRaw: '',
  maxOutputTokens: 32_768,
  topP: 0.95,
  systemInstruction: '',
} as const

export function normalizeNanobananaProImageSize(raw: string | undefined): NanobananaProImageSize {
  const s = (raw ?? '1K').trim()
  if ((NANOBANANA_PRO_IMAGE_SIZES as readonly string[]).includes(s)) return s as NanobananaProImageSize
  return '1K'
}

export function resolveNanobananaProRequest(raw: unknown): NanobananaProRequestOptions {
  const o = asRequestBodyRecord(raw)

  return {
    temperature: clampStudioTemperature(
      typeof o.temperature === 'number' ? o.temperature : undefined,
      NANOBANANA_PRO_DEFAULTS.temperature,
    ),
    image_size: normalizeNanobananaProImageSize(
      typeof o.image_size === 'string' ? o.image_size : undefined,
    ),
    grounding_web: Boolean(o.grounding_web),
    stop_sequences: parseStopSequencesField(o.stop_sequences),
    max_output_tokens: clampStudioMaxOutputTokens(
      typeof o.max_output_tokens === 'number' ? o.max_output_tokens : undefined,
      NANOBANANA_PRO_DEFAULTS.maxOutputTokens,
    ),
    top_p: clampStudioTopP(
      typeof o.top_p === 'number' ? o.top_p : undefined,
      NANOBANANA_PRO_DEFAULTS.topP,
    ),
    system_instruction: parseOptionalSystemInstruction(o.system_instruction),
  }
}
