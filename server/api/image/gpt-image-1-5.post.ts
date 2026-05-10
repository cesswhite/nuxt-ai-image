import { defineEventHandler, readBody } from 'h3'
import { generateGptImage15, parsePostBodyGptImage15 } from '../../utils/generateImageShared'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  return generateGptImage15(config, parsePostBodyGptImage15(raw))
})
