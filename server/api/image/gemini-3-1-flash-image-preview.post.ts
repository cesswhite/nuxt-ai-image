import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { createError, defineEventHandler, readBody } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiAspectRatios'
import { promptFromBody, requireGeminiKey } from '../../utils/imageApiCommon'
import { dataUrlFromGeminiParts, geminiErrorMessage } from '../../utils/geminiImage'

/** Matches Google’s sample defaults: wide aspect + 4K, image search, high thinking, image-only output. */
const MODEL = 'gemini-3.1-flash-image-preview' as const

const tools = [
  {
    googleSearch: {
      searchTypes: {
        imageSearch: {},
      },
    },
  },
]

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  requireGeminiKey(runtime)

  const raw = await readBody(event).catch(() => ({}))
  const o = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {}

  const prompt = promptFromBody(o.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const aspectRatio = typeof o.aspect_ratio === 'string' && o.aspect_ratio.trim()
    ? o.aspect_ratio.trim()
    : '21:9'

  const sizeRaw = typeof o.image_size === 'string' ? o.image_size.trim() : ''
  const imageSize
    = sizeRaw === '512' || sizeRaw === '1K' || sizeRaw === '2K' || sizeRaw === '4K'
      ? sizeRaw
      : '4K'

  const imageConfig = buildGeminiImageConfig(MODEL, aspectRatio, { gemini3ImageSize: imageSize })

  try {
    const ai = new GoogleGenAI({ apiKey: String(runtime.geminiApiKey).trim() })
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        imageConfig,
        responseModalities: ['IMAGE'],
        tools,
      } as never,
    })

    let lastParts: unknown[] | undefined
    for await (const chunk of stream) {
      const parts = chunk.candidates?.[0]?.content?.parts as unknown[] | undefined
      if (parts?.length) lastParts = parts
    }

    const output = dataUrlFromGeminiParts(lastParts)
    if (!output) {
      throw createError({
        statusCode: 502,
        message: 'No image in Gemini response — try a different prompt or model.',
      })
    }
    return { output, provider: 'google-gemini', model: MODEL }
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
})
