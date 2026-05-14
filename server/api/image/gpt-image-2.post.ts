import { createError, defineEventHandler, readBody } from 'h3'
import OpenAI from 'openai'
import { promptFromBody, requireOpenAiKey } from '../../utils/imageApiCommon'
import {
  dataUrlFromOpenAiResult,
  normalizeGptImage2Size,
  normalizeOpenAiQuality,
} from '../../utils/openAiImageSize'

const MODEL = 'gpt-image-2' as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  requireOpenAiKey(config)
  const prompt = promptFromBody(o.prompt)
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }
  const quality = normalizeOpenAiQuality(
    typeof o.openai_quality === 'string' ? o.openai_quality : undefined,
  )
  const size = normalizeGptImage2Size(
    typeof o.openai_size === 'string' ? o.openai_size : undefined,
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
    const b64 = first?.b64_json
    const outFmt = first && 'output_format' in first && first.output_format
      ? (first.output_format as 'png' | 'jpeg' | 'webp')
      : undefined
    const output = dataUrlFromOpenAiResult(b64, outFmt)
    return { output, provider: 'openai', model: MODEL }
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    const msg = e instanceof Error ? e.message : 'OpenAI image generation failed'
    throw createError({ statusCode: 502, message: msg })
  }
})
