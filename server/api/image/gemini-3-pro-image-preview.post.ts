import { createError, defineEventHandler } from 'h3'
import { buildGeminiImageConfig } from '~/utils/geminiImageUtils'
import { resolveNanobananaProRequest } from '~/utils/geminiProNanobanana'
import {
  aspectRatioFromBody,
  optionalNestedRecord,
  promptFromBody,
  readJsonBody,
  requireGeminiKey,
} from '../../utils/imageApiCommon'
import { generateGeminiImageFromStream, rethrowGeminiImageError } from '../../utils/geminiImage'

const MODEL = 'gemini-3-pro-image-preview' as const

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  requireGeminiKey(runtime)

  const body = await readJsonBody(event)
  const prompt = promptFromBody(body.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const aspectRatio = aspectRatioFromBody(body, '1:1')
  const nPro = resolveNanobananaProRequest(optionalNestedRecord(body.nanobanana_pro))
  const imageConfig = buildGeminiImageConfig(MODEL, aspectRatio, {
    gemini3ImageSize: nPro.image_size,
  })

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
  if (nPro.grounding_web) {
    configPayload.tools = [{ googleSearch: {} }]
  }

  try {
    return await generateGeminiImageFromStream({
      apiKey: String(runtime.geminiApiKey),
      model: MODEL,
      prompt,
      config: configPayload,
    })
  }
  catch (e: unknown) {
    rethrowGeminiImageError(e)
  }
})
