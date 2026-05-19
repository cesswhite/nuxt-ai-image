/**
 * OpenAI image generation helpers for `/api/image/*` routes.
 */
import { createError } from 'h3'
import type { ImageGenResult } from './imageApiCommon'

export function openAiImageErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'OpenAI image generation failed'
}

export function rethrowOpenAiImageError(e: unknown): never {
  if (e && typeof e === 'object' && 'statusCode' in e) throw e
  throw createError({ statusCode: 502, message: openAiImageErrorMessage(e) })
}

export function imageGenResultFromOpenAi(
  output: string,
  model: string,
): ImageGenResult {
  return { output, provider: 'openai', model }
}
