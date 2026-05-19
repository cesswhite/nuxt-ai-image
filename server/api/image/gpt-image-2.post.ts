import { createError, defineEventHandler } from 'h3'
import OpenAI from 'openai'
import {
  promptFromBody,
  readJsonBody,
  requireOpenAiKey,
} from '../../utils/imageApiCommon'
import {
  dataUrlFromOpenAiResult,
  normalizeGptImage2Size,
  normalizeOpenAiQuality,
} from '../../utils/openAiImageSize'
import { imageGenResultFromOpenAi, rethrowOpenAiImageError } from '../../utils/openAiImage'

const MODEL = 'gpt-image-2' as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  requireOpenAiKey(config)

  const body = await readJsonBody(event)
  const prompt = promptFromBody(body.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const quality = normalizeOpenAiQuality(
    typeof body.openai_quality === 'string' ? body.openai_quality : undefined,
  )
  const size = normalizeGptImage2Size(
    typeof body.openai_size === 'string' ? body.openai_size : undefined,
  )

  try {
    const openai = new OpenAI({ apiKey: String(config.openaiApiKey).trim() })
    const res = await openai.images.generate({
      model: MODEL,
      prompt,
      n: 1,
      size,
      quality,
    })
    const first = res.data?.[0]
    const output = dataUrlFromOpenAiResult(
      first?.b64_json,
      first && 'output_format' in first && first.output_format
        ? (first.output_format as 'png' | 'jpeg' | 'webp')
        : undefined,
    )
    return imageGenResultFromOpenAi(output, MODEL)
  }
  catch (e: unknown) {
    rethrowOpenAiImageError(e)
  }
})
