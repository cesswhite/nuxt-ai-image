/**
 * Gemini image streaming helpers for `/api/image/*` routes.
 */
import { GoogleGenAI } from '@google/genai'
import { createError } from 'h3'
import { parseImageDataUrl } from '~/utils/studioImageOutput'
import type { ImageGenResult } from './imageApiCommon'

type GeminiContentPart =
  | { text: string }
  | { inlineData: { mimeType: string, data: string } }

function buildGeminiUserParts(prompt: string, referenceImageDataUrls: string[] = []): GeminiContentPart[] {
  const parts: GeminiContentPart[] = []
  for (const dataUrl of referenceImageDataUrls) {
    const parsed = parseImageDataUrl(dataUrl)
    if (parsed) {
      parts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.data } })
    }
  }
  parts.push({ text: prompt })
  return parts
}

export function dataUrlFromGeminiParts(partsOut: unknown[] | undefined): string | null {
  if (!partsOut?.length) return null
  let lastImage: { data: string, mimeType: string } | null = null
  for (const part of partsOut) {
    const p = part as { thought?: boolean, inlineData?: { data?: string, mimeType?: string } }
    if (p.thought) continue
    if (p.inlineData?.data) {
      lastImage = {
        data: p.inlineData.data,
        mimeType: p.inlineData.mimeType || 'image/png',
      }
    }
  }
  if (!lastImage) {
    for (const part of partsOut) {
      const p = part as { inlineData?: { data?: string, mimeType?: string } }
      if (p.inlineData?.data) {
        lastImage = {
          data: p.inlineData.data,
          mimeType: p.inlineData.mimeType || 'image/png',
        }
      }
    }
  }
  if (!lastImage) return null
  return `data:${lastImage.mimeType};base64,${lastImage.data}`
}

export function geminiErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const anyE = e as Error & { status?: number }
    if (typeof anyE.status === 'number' && e.message) {
      return `${e.message} (HTTP ${anyE.status})`
    }
    return e.message
  }
  return 'Gemini image generation failed'
}

export function rethrowGeminiImageError(e: unknown): never {
  if (e && typeof e === 'object' && 'statusCode' in e) throw e
  const msg = geminiErrorMessage(e)
  const anyE = e as { status?: number }
  const code = typeof anyE.status === 'number' && anyE.status >= 400 && anyE.status < 600
    ? anyE.status
    : 502
  throw createError({ statusCode: code, message: msg })
}

export async function collectGeminiStreamParts(
  stream: AsyncIterable<{ candidates?: Array<{ content?: { parts?: unknown[] } }> }>,
): Promise<unknown[] | undefined> {
  let lastParts: unknown[] | undefined
  for await (const chunk of stream) {
    const parts = chunk.candidates?.[0]?.content?.parts as unknown[] | undefined
    if (parts?.length) lastParts = parts
  }
  return lastParts
}

export async function generateGeminiImageFromStream(params: {
  apiKey: string
  model: string
  prompt: string
  config: Record<string, unknown>
  referenceImageDataUrls?: string[]
}): Promise<ImageGenResult> {
  const ai = new GoogleGenAI({ apiKey: params.apiKey.trim() })
  const stream = await ai.models.generateContentStream({
    model: params.model,
    contents: [{
      role: 'user',
      parts: buildGeminiUserParts(params.prompt, params.referenceImageDataUrls ?? []),
    }],
    config: params.config as never,
  })
  const lastParts = await collectGeminiStreamParts(stream)
  const output = dataUrlFromGeminiParts(lastParts)
  if (!output) {
    throw createError({
      statusCode: 502,
      message: 'No image in Gemini response — try a different prompt or model.',
    })
  }
  return { output, provider: 'google-gemini', model: params.model }
}
