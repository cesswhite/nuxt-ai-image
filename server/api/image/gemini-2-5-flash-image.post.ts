import { GoogleGenAI } from '@google/genai'
import { createError, defineEventHandler, readBody } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiAspectRatios'
import { resolveNanobanana25Request } from '~/utils/gemini25Nanobanana'
import { promptFromBody, requireGeminiKey, asNestedRecord } from '../../utils/imageApiCommon'
import { dataUrlFromGeminiParts, geminiErrorMessage } from '../../utils/geminiImage'

const MODEL = 'gemini-2.5-flash-image' as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  requireGeminiKey(config)
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
      model: MODEL,
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
