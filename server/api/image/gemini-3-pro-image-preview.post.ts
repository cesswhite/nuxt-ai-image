import { defineEventHandler, readBody } from 'h3'
import {
  generateGemini3ProImagePreview,
  parsePostBodyGemini3ProImagePreview,
} from '../../utils/generateImageShared'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  return generateGemini3ProImagePreview(config, parsePostBodyGemini3ProImagePreview(raw))
})
