import { defineEventHandler, readBody } from 'h3'
import {
  generateGemini31FlashImagePreview,
  parsePostBodyGemini31FlashImagePreview,
} from '../../utils/generateImageShared'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  return generateGemini31FlashImagePreview(config, parsePostBodyGemini31FlashImagePreview(raw))
})
