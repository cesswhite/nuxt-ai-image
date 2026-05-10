import { defineEventHandler, readBody } from 'h3'
import { runEnhancePrompt } from '../../utils/promptAssistOpenAi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = (await readBody(event).catch(() => ({}))) as { prompt?: string }
  const prompt = typeof body.prompt === 'string' ? body.prompt : ''
  return runEnhancePrompt(config, prompt)
})
