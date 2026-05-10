/**
 * Nanobanana Pro (`gemini-3-pro-image-preview`) — parity with Google AI Studio run settings.
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */

import {
  clampNanobanana2Temperature,
  clampNanobanana2TopP,
} from '~/utils/gemini31Nanobanana2'

export const NANOBANANA_PRO_IMAGE_SIZES = ['1K', '2K', '4K'] as const
export type NanobananaProImageSize = (typeof NANOBANANA_PRO_IMAGE_SIZES)[number]

export interface NanobananaProRequestOptions {
  temperature?: number
  image_size?: NanobananaProImageSize | string
  grounding_web?: boolean
  stop_sequences?: string[]
  max_output_tokens?: number
  top_p?: number
  /** Optional tone and style instructions (maps to `systemInstruction`). */
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

export function clampNanobananaProMaxOutputTokens(n: number | undefined): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return NANOBANANA_PRO_DEFAULTS.maxOutputTokens
  return Math.min(65_536, Math.max(1, Math.floor(n)))
}

/** Parse `body.nanobanana_pro` for `gemini-3-pro-image-preview`. */
export function resolveNanobananaProRequest(raw: unknown): NanobananaProRequestOptions {
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

  const sys = typeof o.system_instruction === 'string' ? o.system_instruction.trim() : ''
  const system_instruction = sys.length > 0 ? sys : undefined

  return {
    temperature: clampNanobanana2Temperature(
      typeof o.temperature === 'number' ? o.temperature : undefined,
    ),
    image_size: normalizeNanobananaProImageSize(
      typeof o.image_size === 'string' ? o.image_size : undefined,
    ),
    grounding_web: Boolean(o.grounding_web),
    stop_sequences,
    max_output_tokens: clampNanobananaProMaxOutputTokens(
      typeof o.max_output_tokens === 'number' ? o.max_output_tokens : undefined,
    ),
    top_p: clampNanobanana2TopP(typeof o.top_p === 'number' ? o.top_p : undefined),
    system_instruction,
  }
}
