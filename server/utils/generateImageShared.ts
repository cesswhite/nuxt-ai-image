/**
 * Shared image generation logic — one entry point per studio model (used by `/api/image/*`).
 */
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { createError } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiAspectRatios'
import { resolveNanobanana2Request } from '~/utils/gemini31Nanobanana2'
import { resolveNanobananaProRequest } from '~/utils/geminiProNanobanana'
import { resolveNanobanana25Request } from '~/utils/gemini25Nanobanana'
import { buildGemini31SearchTools } from './gemini31Tools'
import { dataUrlFromGeminiParts, geminiErrorMessage } from './geminiImage'
import {
  dataUrlFromOpenAiResult,
  normalizeGptImage2Size,
  normalizeOpenAiQuality,
  openAiGptImage15SizeForAspect,
} from './openAiImageSize'

export const MODEL_GPT_IMAGE_15 = 'gpt-image-1.5' as const
export const MODEL_GPT_IMAGE_2 = 'gpt-image-2' as const
export const MODEL_GEMINI_31_FLASH_IMAGE = 'gemini-3.1-flash-image-preview' as const
export const MODEL_GEMINI_3_PRO_IMAGE = 'gemini-3-pro-image-preview' as const
export const MODEL_GEMINI_25_FLASH_IMAGE = 'gemini-2.5-flash-image' as const

export interface ImageGenResult {
  output: string
  provider: 'openai' | 'google-gemini'
  model: string
}

function requireGeminiKey(config: { geminiApiKey?: string }) {
  const hasGemini = Boolean(config.geminiApiKey && String(config.geminiApiKey).trim())
  if (!hasGemini) {
    throw createError({
      statusCode: 503,
      message:
        'Gemini is selected but GEMINI_API_KEY (or GOOGLE_API_KEY / NUXT_GEMINI_API_KEY) is not set. Add it to .env.',
    })
  }
}

function requireOpenAiKey(config: { openaiApiKey?: string }) {
  const hasOpenAI = Boolean(config.openaiApiKey && String(config.openaiApiKey).trim())
  if (!hasOpenAI) {
    throw createError({
      statusCode: 503,
      message: 'OpenAI is selected but OPENAI_API_KEY is not set. Add it to .env.',
    })
  }
}

/** `readBody` JSON may omit or mistype `prompt`; validate after trim. */
function promptFromBody(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : ''
}

/** POST JSON body from `readBody` — `prompt` is optional until validated in each generator. */
export type PostBodyGptImage15 = {
  prompt?: string
  aspect_ratio?: string
  openai_quality?: string
}

export type PostBodyGptImage2 = {
  prompt?: string
  openai_size?: string
  openai_quality?: string
}

export type PostBodyGemini31FlashImagePreview = {
  prompt?: string
  aspect_ratio?: string
  nanobanana2?: Record<string, unknown>
}

export type PostBodyGemini3ProImagePreview = {
  prompt?: string
  aspect_ratio?: string
  nanobanana_pro?: Record<string, unknown>
}

export type PostBodyGemini25FlashImage = {
  prompt?: string
  aspect_ratio?: string
  nanobanana_25?: Record<string, unknown>
}

export async function generateGptImage15(
  config: { openaiApiKey?: string },
  input: PostBodyGptImage15,
): Promise<ImageGenResult> {
  requireOpenAiKey(config)
  const prompt = promptFromBody(input.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }
  const aspectRatio = typeof input.aspect_ratio === 'string' && input.aspect_ratio.trim()
    ? input.aspect_ratio.trim()
    : '1:1'
  const quality = normalizeOpenAiQuality(input.openai_quality)

  try {
    const openai = new OpenAI({ apiKey: String(config.openaiApiKey).trim() })
    const size = openAiGptImage15SizeForAspect(aspectRatio)
    const res = await openai.images.generate({
      model: MODEL_GPT_IMAGE_15,
      prompt,
      n: 1,
      size,
      quality,
    })
    const first = res.data?.[0]
    const b64 = first?.b64_json
    const outFmt = first && 'output_format' in first && first.output_format
      ? (first.output_format as 'png' | 'jpeg' | 'webp')
      : undefined
    const output = dataUrlFromOpenAiResult(b64, outFmt)
    return { output, provider: 'openai', model: MODEL_GPT_IMAGE_15 }
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    const msg = e instanceof Error ? e.message : 'OpenAI image generation failed'
    throw createError({ statusCode: 502, message: msg })
  }
}

export async function generateGptImage2(
  config: { openaiApiKey?: string },
  input: PostBodyGptImage2,
): Promise<ImageGenResult> {
  requireOpenAiKey(config)
  const prompt = promptFromBody(input.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }
  const quality = normalizeOpenAiQuality(input.openai_quality)
  const size = normalizeGptImage2Size(
    typeof input.openai_size === 'string' ? input.openai_size : undefined,
  )

  try {
    const openai = new OpenAI({ apiKey: String(config.openaiApiKey).trim() })
    const res = await openai.images.generate({
      model: MODEL_GPT_IMAGE_2,
      prompt,
      n: 1,
      size,
      quality,
    })
    const first = res.data?.[0]
    const b64 = first?.b64_json
    const outFmt = first && 'output_format' in first && first.output_format
      ? (first.output_format as 'png' | 'jpeg' | 'webp')
      : undefined
    const output = dataUrlFromOpenAiResult(b64, outFmt)
    return { output, provider: 'openai', model: MODEL_GPT_IMAGE_2 }
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    const msg = e instanceof Error ? e.message : 'OpenAI image generation failed'
    throw createError({ statusCode: 502, message: msg })
  }
}

export async function generateGemini31FlashImagePreview(
  config: { geminiApiKey?: string },
  input: PostBodyGemini31FlashImagePreview,
): Promise<ImageGenResult> {
  requireGeminiKey(config)
  const prompt = promptFromBody(input.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }
  const aspectRatio = typeof input.aspect_ratio === 'string' && input.aspect_ratio.trim()
    ? input.aspect_ratio.trim()
    : '1:1'

  const n31 = resolveNanobanana2Request(input.nanobanana2)
  const imageConfig = buildGeminiImageConfig(MODEL_GEMINI_31_FLASH_IMAGE, aspectRatio, {
    gemini3ImageSize: n31.image_size,
  })
  const responseModalities
    = n31.output_format === 'image_only' ? ['IMAGE'] : ['TEXT', 'IMAGE']
  const tools = buildGemini31SearchTools(n31)

  try {
    const client = new GoogleGenAI({ apiKey: String(config.geminiApiKey).trim() })
    const genConfig: Record<string, unknown> = {
      responseModalities,
      imageConfig,
      temperature: n31.temperature,
      topP: n31.top_p,
      maxOutputTokens: n31.max_output_tokens,
    }
    if (n31.stop_sequences?.length) {
      genConfig.stopSequences = n31.stop_sequences
    }
    if (tools?.length) {
      genConfig.tools = tools
    }

    const response = await client.models.generateContent({
      model: MODEL_GEMINI_31_FLASH_IMAGE,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: genConfig,
    } as never)

    const parts = response.candidates?.[0]?.content?.parts
    const output = dataUrlFromGeminiParts(parts as unknown[])
    if (!output) {
      throw createError({
        statusCode: 502,
        message: 'No image in Gemini response — try a different prompt or model.',
      })
    }
    return { output, provider: 'google-gemini', model: MODEL_GEMINI_31_FLASH_IMAGE }
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    const msg = geminiErrorMessage(e)
    const anyE = e as { status?: number }
    const code = typeof anyE.status === 'number' && anyE.status >= 400 && anyE.status < 600
      ? anyE.status
      : 502
    throw createError({ statusCode: code, message: msg })
  }
}

export async function generateGemini3ProImagePreview(
  config: { geminiApiKey?: string },
  input: PostBodyGemini3ProImagePreview,
): Promise<ImageGenResult> {
  requireGeminiKey(config)
  const prompt = promptFromBody(input.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }
  const aspectRatio = typeof input.aspect_ratio === 'string' && input.aspect_ratio.trim()
    ? input.aspect_ratio.trim()
    : '1:1'

  const nPro = resolveNanobananaProRequest(input.nanobanana_pro)
  const imageConfig = buildGeminiImageConfig(MODEL_GEMINI_3_PRO_IMAGE, aspectRatio, {
    gemini3ImageSize: nPro.image_size,
  })
  const tools = nPro.grounding_web ? [{ googleSearch: {} }] : undefined

  try {
    const client = new GoogleGenAI({ apiKey: String(config.geminiApiKey).trim() })
    const genConfig: Record<string, unknown> = {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig,
      temperature: nPro.temperature,
      topP: nPro.top_p,
      maxOutputTokens: nPro.max_output_tokens,
    }
    if (nPro.stop_sequences?.length) {
      genConfig.stopSequences = nPro.stop_sequences
    }
    if (nPro.system_instruction) {
      genConfig.systemInstruction = nPro.system_instruction
    }
    if (tools?.length) {
      genConfig.tools = tools
    }

    const response = await client.models.generateContent({
      model: MODEL_GEMINI_3_PRO_IMAGE,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: genConfig,
    } as never)

    const parts = response.candidates?.[0]?.content?.parts
    const output = dataUrlFromGeminiParts(parts as unknown[])
    if (!output) {
      throw createError({
        statusCode: 502,
        message: 'No image in Gemini response — try a different prompt or model.',
      })
    }
    return { output, provider: 'google-gemini', model: MODEL_GEMINI_3_PRO_IMAGE }
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    const msg = geminiErrorMessage(e)
    const anyE = e as { status?: number }
    const code = typeof anyE.status === 'number' && anyE.status >= 400 && anyE.status < 600
      ? anyE.status
      : 502
    throw createError({ statusCode: code, message: msg })
  }
}

export async function generateGemini25FlashImage(
  config: { geminiApiKey?: string },
  input: PostBodyGemini25FlashImage,
): Promise<ImageGenResult> {
  requireGeminiKey(config)
  const prompt = promptFromBody(input.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }
  const aspectRatio = typeof input.aspect_ratio === 'string' && input.aspect_ratio.trim()
    ? input.aspect_ratio.trim()
    : '1:1'

  const n25 = resolveNanobanana25Request(input.nanobanana_25)
  const imageConfig = buildGeminiImageConfig(MODEL_GEMINI_25_FLASH_IMAGE, aspectRatio)

  try {
    const client = new GoogleGenAI({ apiKey: String(config.geminiApiKey).trim() })
    const genConfig: Record<string, unknown> = {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig,
      temperature: n25.temperature,
      topP: n25.top_p,
      maxOutputTokens: n25.max_output_tokens,
    }
    if (n25.stop_sequences?.length) {
      genConfig.stopSequences = n25.stop_sequences
    }
    if (n25.system_instruction) {
      genConfig.systemInstruction = n25.system_instruction
    }

    const response = await client.models.generateContent({
      model: MODEL_GEMINI_25_FLASH_IMAGE,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: genConfig,
    } as never)

    const parts = response.candidates?.[0]?.content?.parts
    const output = dataUrlFromGeminiParts(parts as unknown[])
    if (!output) {
      throw createError({
        statusCode: 502,
        message: 'No image in Gemini response — try a different prompt or model.',
      })
    }
    return { output, provider: 'google-gemini', model: MODEL_GEMINI_25_FLASH_IMAGE }
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    const msg = geminiErrorMessage(e)
    const anyE = e as { status?: number }
    const code = typeof anyE.status === 'number' && anyE.status >= 400 && anyE.status < 600
      ? anyE.status
      : 502
    throw createError({ statusCode: code, message: msg })
  }
}

// --- Route helpers: narrow `readBody()` to `PostBody*` (avoids `Parameters<>` / assertion drift). ---

function asNestedRecord(val: unknown): Record<string, unknown> | undefined {
  if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>
  }
  return undefined
}

export function parsePostBodyGptImage15(raw: unknown): PostBodyGptImage15 {
  if (raw === null || raw === undefined || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  return {
    prompt: typeof o.prompt === 'string' ? o.prompt : undefined,
    aspect_ratio: typeof o.aspect_ratio === 'string' ? o.aspect_ratio : undefined,
    openai_quality: typeof o.openai_quality === 'string' ? o.openai_quality : undefined,
  }
}

export function parsePostBodyGptImage2(raw: unknown): PostBodyGptImage2 {
  if (raw === null || raw === undefined || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  return {
    prompt: typeof o.prompt === 'string' ? o.prompt : undefined,
    openai_size: typeof o.openai_size === 'string' ? o.openai_size : undefined,
    openai_quality: typeof o.openai_quality === 'string' ? o.openai_quality : undefined,
  }
}

export function parsePostBodyGemini31FlashImagePreview(raw: unknown): PostBodyGemini31FlashImagePreview {
  if (raw === null || raw === undefined || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  return {
    prompt: typeof o.prompt === 'string' ? o.prompt : undefined,
    aspect_ratio: typeof o.aspect_ratio === 'string' ? o.aspect_ratio : undefined,
    nanobanana2: asNestedRecord(o.nanobanana2),
  }
}

export function parsePostBodyGemini3ProImagePreview(raw: unknown): PostBodyGemini3ProImagePreview {
  if (raw === null || raw === undefined || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  return {
    prompt: typeof o.prompt === 'string' ? o.prompt : undefined,
    aspect_ratio: typeof o.aspect_ratio === 'string' ? o.aspect_ratio : undefined,
    nanobanana_pro: asNestedRecord(o.nanobanana_pro),
  }
}

export function parsePostBodyGemini25FlashImage(raw: unknown): PostBodyGemini25FlashImage {
  if (raw === null || raw === undefined || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  return {
    prompt: typeof o.prompt === 'string' ? o.prompt : undefined,
    aspect_ratio: typeof o.aspect_ratio === 'string' ? o.aspect_ratio : undefined,
    nanobanana_25: asNestedRecord(o.nanobanana_25),
  }
}
