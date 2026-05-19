/**
 * Nanobanana (`gemini-2.5-flash-image`) — parity with Google AI Studio run settings.
 */

import {
  asRequestBodyRecord,
  clampStudioMaxOutputTokens,
  clampStudioTemperature,
  clampStudioTopP,
  parseOptionalSystemInstruction,
  parseStopSequencesField,
} from '~/utils/geminiImageUtils'

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

export function resolveNanobanana25Request(raw: unknown): Nanobanana25RequestOptions {
  const o = asRequestBodyRecord(raw)

  return {
    temperature: clampStudioTemperature(
      typeof o.temperature === 'number' ? o.temperature : undefined,
      NANOBANANA_25_DEFAULTS.temperature,
    ),
    max_output_tokens: clampStudioMaxOutputTokens(
      typeof o.max_output_tokens === 'number' ? o.max_output_tokens : undefined,
      NANOBANANA_25_DEFAULTS.maxOutputTokens,
    ),
    top_p: clampStudioTopP(
      typeof o.top_p === 'number' ? o.top_p : undefined,
      NANOBANANA_25_DEFAULTS.topP,
    ),
    stop_sequences: parseStopSequencesField(o.stop_sequences),
    system_instruction: parseOptionalSystemInstruction(o.system_instruction),
  }
}
