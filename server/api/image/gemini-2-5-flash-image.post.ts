import { createError, defineEventHandler } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiImageUtils'
import { resolveNanobanana25Request } from '~/utils/gemini25Nanobanana'
import {
  aspectRatioFromBody,
  optionalNestedRecord,
  promptFromBody,
  readJsonBody,
  referenceImageDataUrlsFromBody,
  requireGeminiKey,
} from '../../utils/imageApiCommon'
import { generateGeminiImageFromStream, rethrowGeminiImageError } from '../../utils/geminiImage'

const MODEL = 'gemini-2.5-flash-image' as const

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  requireGeminiKey(runtime)

  const body = await readJsonBody(event)
  const prompt = promptFromBody(body.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const aspectRatio = aspectRatioFromBody(body, '1:1')
  const n25 = resolveNanobanana25Request(optionalNestedRecord(body.nanobanana_25))
  const imageConfig = buildGeminiImageConfig(MODEL, aspectRatio)

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

  try {
    return await generateGeminiImageFromStream({
      apiKey: String(runtime.geminiApiKey),
      model: MODEL,
      prompt,
      config: configPayload,
      referenceImageDataUrls: referenceImageDataUrlsFromBody(body, MODEL),
    })
  }
  catch (e: unknown) {
    rethrowGeminiImageError(e)
  }
})
