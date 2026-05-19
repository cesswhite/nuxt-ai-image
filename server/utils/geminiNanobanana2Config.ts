/**
 * Build Gemini API `config` for Nanobanana 2 from resolved studio options.
 */
import { ThinkingLevel } from '@google/genai'
import { buildGeminiImageConfig } from '~/utils/geminiImageUtils'
import type { Nanobanana2RequestOptions } from '~/utils/gemini31Nanobanana2'
import { STUDIO_IMAGE_MODEL } from '~/utils/studioImageModels'

const MODEL = STUDIO_IMAGE_MODEL.NANOBANANA2

const THINKING_BY_LEVEL: Record<
  NonNullable<Nanobanana2RequestOptions['thinking_level']>,
  ThinkingLevel
> = {
  minimal: ThinkingLevel.MINIMAL,
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
  high: ThinkingLevel.HIGH,
}

export function buildNanobanana2GeminiConfig(
  aspectRatio: string,
  opts: Nanobanana2RequestOptions,
): Record<string, unknown> {
  const imageConfig = buildGeminiImageConfig(MODEL, aspectRatio, {
    gemini3ImageSize: opts.image_size,
  })

  const config: Record<string, unknown> = {
    imageConfig,
    temperature: opts.temperature,
    topP: opts.top_p,
    maxOutputTokens: opts.max_output_tokens,
    responseModalities:
      opts.output_format === 'image_only' ? ['IMAGE'] : ['TEXT', 'IMAGE'],
  }

  if (opts.thinking_level) {
    config.thinkingConfig = {
      thinkingLevel: THINKING_BY_LEVEL[opts.thinking_level],
      ...(opts.include_thoughts !== undefined
        ? { includeThoughts: opts.include_thoughts }
        : {}),
    }
  }

  if (opts.stop_sequences?.length) {
    config.stopSequences = opts.stop_sequences
  }

  const tools: unknown[] = []
  if (opts.grounding_web) {
    tools.push({ googleSearch: {} })
  }
  if (opts.grounding_image_search) {
    tools.push({
      googleSearch: {
        searchTypes: { imageSearch: {} },
      },
    })
  }
  if (tools.length) {
    config.tools = tools
  }

  return config
}
