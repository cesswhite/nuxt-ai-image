import { createError, defineEventHandler } from 'h3'
import OpenAI from 'openai'
import {
  promptFromBody,
  readJsonBody,
  requireOpenAiKey,
} from '../../utils/imageApiCommon'
import {
  dataUrlFromOpenAiResult,
  normalizeOpenAiQuality,
  openAiGptImage15SizeForAspect,
} from '../../utils/openAiImageSize'
import { imageGenResultFromOpenAi, rethrowOpenAiImageError } from '../../utils/openAiImage'

const MODEL = 'gpt-image-1.5' as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  requireOpenAiKey(config)

  const body = await readJsonBody(event)
  const prompt = promptFromBody(body.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const aspectRatio = typeof body.aspect_ratio === 'string' && body.aspect_ratio.trim()
    ? body.aspect_ratio.trim()
    : '1:1'
  const quality = normalizeOpenAiQuality(
    typeof body.openai_quality === 'string' ? body.openai_quality : undefined,
  )

  try {
    const openai = new OpenAI({ apiKey: String(config.openaiApiKey).trim() })
    const res = await openai.images.generate({
      model: MODEL,
      prompt,
      n: 1,
      size: openAiGptImage15SizeForAspect(aspectRatio),
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
