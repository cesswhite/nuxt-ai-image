/**
 * Nanobanana (`gemini-2.5-flash-image`) — parity with Google AI Studio run settings.
 * No resolution / grounding in Studio for this model (aspect + generation params only).
 */

import {
  clampNanobanana2Temperature,
  clampNanobanana2TopP,
} from '~/utils/gemini31Nanobanana2'
import { clampNanobananaProMaxOutputTokens } from '~/utils/geminiProNanobanana'

export interface Nanobanana25RequestOptions {
  temperature: number
  max_output_tokens: number
  top_p: number
  stop_sequences?: string[]
  system_instruction?: string
}

export const NANOBANANA_25_DEFAULTS = {
  temperature: 1,
  stopSequencesRaw: '',
  maxOutputTokens: 32_768,
  topP: 0.95,
  systemInstruction: '',
} as const

/** Parse `body.nanobanana_25` for `gemini-2.5-flash-image`. */
export function resolveNanobanana25Request(raw: unknown): Nanobanana25RequestOptions {
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
    max_output_tokens: clampNanobananaProMaxOutputTokens(
      typeof o.max_output_tokens === 'number' ? o.max_output_tokens : undefined,
    ),
    top_p: clampNanobanana2TopP(typeof o.top_p === 'number' ? o.top_p : undefined),
    stop_sequences,
    system_instruction,
  }
}
