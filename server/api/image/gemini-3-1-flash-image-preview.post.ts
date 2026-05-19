import { createError, defineEventHandler } from 'h3'
import { resolveNanobanana2Request } from '~/utils/gemini31Nanobanana2'
import {
  aspectRatioFromBody,
  promptFromBody,
  readJsonBody,
  requireGeminiKey,
} from '../../utils/imageApiCommon'
import { generateGeminiImageFromStream, rethrowGeminiImageError } from '../../utils/geminiImage'
import { buildNanobanana2GeminiConfig } from '../../utils/geminiNanobanana2Config'

const MODEL = 'gemini-3.1-flash-image-preview' as const

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  requireGeminiKey(runtime)

  const body = await readJsonBody(event)
  const prompt = promptFromBody(body.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const aspectRatio = aspectRatioFromBody(body, '1:1')
  const n2 = resolveNanobanana2Request(body)
  const config = buildNanobanana2GeminiConfig(aspectRatio, n2)

  try {
    return await generateGeminiImageFromStream({
      apiKey: String(runtime.geminiApiKey),
      model: MODEL,
      prompt,
      config,
    })
  }
  catch (e: unknown) {
    rethrowGeminiImageError(e)
  }
})
