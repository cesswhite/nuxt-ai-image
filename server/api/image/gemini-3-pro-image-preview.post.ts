import { GoogleGenAI } from '@google/genai'
import { createError, defineEventHandler, readBody } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiAspectRatios'
import { resolveNanobananaProRequest } from '~/utils/geminiProNanobanana'
import { asNestedRecord, promptFromBody, requireGeminiKey } from '../../utils/imageApiCommon'
import { dataUrlFromGeminiParts, geminiErrorMessage } from '../../utils/geminiImage'

/** `gemini-3-pro-image-preview` — streaming + `imageConfig` + 1K/2K/4K, optional Search grounding and system instruction. */
const MODEL = 'gemini-3-pro-image-preview' as const

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
    : '1:1'

  const nPro = resolveNanobananaProRequest(asNestedRecord(o.nanobanana_pro))
  const imageConfig = buildGeminiImageConfig(MODEL, aspectRatio, {
    gemini3ImageSize: nPro.image_size,
  })

  const tools = nPro.grounding_web ? [{ googleSearch: {} }] : undefined

  try {
    const ai = new GoogleGenAI({ apiKey: String(runtime.geminiApiKey).trim() })

    const configPayload: Record<string, unknown> = {
      responseModalities: ['IMAGE'],
      imageConfig,
      temperature: nPro.temperature,
      topP: nPro.top_p,
      maxOutputTokens: nPro.max_output_tokens,
    }
    if (nPro.stop_sequences?.length) {
      configPayload.stopSequences = nPro.stop_sequences
    }
    if (nPro.system_instruction) {
      configPayload.systemInstruction = nPro.system_instruction
    }
    if (tools?.length) {
      configPayload.tools = tools
    }

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: configPayload as never,
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
