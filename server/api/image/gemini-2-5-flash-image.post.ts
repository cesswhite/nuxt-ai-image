import { GoogleGenAI } from '@google/genai'
import { createError, defineEventHandler, readBody } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiAspectRatios'
import { resolveNanobanana25Request } from '~/utils/gemini25Nanobanana'
import { asNestedRecord, promptFromBody, requireGeminiKey } from '../../utils/imageApiCommon'
import { dataUrlFromGeminiParts, geminiErrorMessage } from '../../utils/geminiImage'

/** `gemini-2.5-flash-image` — streaming + aspect-only `imageConfig` (no `imageSize`); optional system instruction. */
const MODEL = 'gemini-2.5-flash-image' as const

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

  const n25 = resolveNanobanana25Request(asNestedRecord(o.nanobanana_25))
  const imageConfig = buildGeminiImageConfig(MODEL, aspectRatio)

  try {
    const ai = new GoogleGenAI({ apiKey: String(runtime.geminiApiKey).trim() })

    const configPayload: Record<string, unknown> = {
      responseModalities: ['IMAGE'],
      imageConfig,
      temperature: n25.temperature,
      topP: n25.top_p,
      maxOutputTokens: n25.max_output_tokens,
    }
    if (n25.stop_sequences?.length) {
      configPayload.stopSequences = n25.stop_sequences
    }
    if (n25.system_instruction) {
      configPayload.systemInstruction = n25.system_instruction
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
