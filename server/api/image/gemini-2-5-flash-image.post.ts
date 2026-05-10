import { defineEventHandler, readBody } from 'h3'
import { generateGemini25FlashImage, parsePostBodyGemini25FlashImage } from '../../utils/generateImageShared'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  return generateGemini25FlashImage(config, parsePostBodyGemini25FlashImage(raw))
})
