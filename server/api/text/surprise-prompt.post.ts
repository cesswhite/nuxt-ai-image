import { defineEventHandler } from 'h3'
import { runSurprisePrompt } from '../../utils/promptAssistOpenAi'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  return runSurprisePrompt(config)
})
