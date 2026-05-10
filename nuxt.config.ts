// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/image', '@vueuse/motion/nuxt'],
  image: {
    format: ['avif', 'webp'],
  },
  devtools: { enabled: !isProd },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-11-11',
  routeRules: {
    '/': { prerender: true },
    ...(isProd
      ? {
          '/_nuxt/**': {
            headers: {
              'cache-control': 'public, max-age=31536000, immutable',
            },
          },
        }
      : {}),
    '/**': {
      headers: {
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
      },
    },
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    /** Chat model for Enhance / Surprise Me (text). Image generation uses image models separately. */
    openaiPromptModel:
      process.env.OPENAI_PROMPT_MODEL
      || process.env.NUXT_OPENAI_PROMPT_MODEL
      || 'gpt-4o-mini',
    geminiApiKey:
      process.env.GEMINI_API_KEY
      || process.env.NUXT_GEMINI_API_KEY
      || process.env.GOOGLE_API_KEY
      || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '',
    },
  },
  nitro: {
    compressPublicAssets: true,
  },
})