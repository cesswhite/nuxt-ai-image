import { defineEventHandler, readBody } from 'h3'
import { generateGptImage2, parsePostBodyGptImage2 } from '../../utils/generateImageShared'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const raw = await readBody(event).catch(() => ({}))
  return generateGptImage2(config, parsePostBodyGptImage2(raw))
})
