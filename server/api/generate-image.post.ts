import { createError, defineEventHandler, readBody } from 'h3'

export interface GenerateImageBody {
  prompt?: string
  provider?: 'openai' | 'google-gemini'
  model?: string
  aspect_ratio?: string
}

/** Tiny SVG placeholder — no network; safe for demo mode and performance testing. */
function demoPlaceholderDataUrl(aspectHint: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0d9488"/><stop offset="100%" stop-color="#115e59"/></linearGradient></defs><rect width="768" height="768" fill="url(#g)"/><text x="384" y="360" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="600">Nuxt AI Images</text><text x="384" y="410" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif" font-size="16">${aspectHint}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const pub = config.public
  const body = (await readBody(event).catch(() => ({}))) as GenerateImageBody

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) {
    throw createError({ statusCode: 400, message: 'prompt is required.' })
  }

  const provider = body.provider === 'openai' ? 'openai' : 'google-gemini'
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : 'template-default'
  const aspectRatio = typeof body.aspect_ratio === 'string' && body.aspect_ratio.trim()
    ? body.aspect_ratio.trim()
    : '1:1'

  if (pub.imageGenDemo) {
    return {
      output: demoPlaceholderDataUrl(`${aspectRatio} · ${provider}`),
      provider,
      model,
      demo: true,
    }
  }

  const hasOpenAI = Boolean(config.openaiApiKey && String(config.openaiApiKey).trim())
  const hasGemini = Boolean(config.geminiApiKey && String(config.geminiApiKey).trim())

  if (provider === 'openai' && !hasOpenAI) {
    throw createError({
      statusCode: 503,
      message: 'OpenAI is selected but OPENAI_API_KEY is not set. Add it to .env or enable NUXT_PUBLIC_IMAGE_GEN_DEMO=true.',
    })
  }

  if (provider === 'google-gemini' && !hasGemini) {
    throw createError({
      statusCode: 503,
      message: 'Gemini is selected but GEMINI_API_KEY (or GOOGLE_API_KEY) is not set. Add it or enable NUXT_PUBLIC_IMAGE_GEN_DEMO=true.',
    })
  }

  throw createError({
    statusCode: 501,
    message:
      'Keys are present but this template does not call external image APIs yet. Implement `openai.images.generate` or Google GenAI in this file (see docs/IMAGE_PIPELINE.md), or use demo mode.',
  })
})
