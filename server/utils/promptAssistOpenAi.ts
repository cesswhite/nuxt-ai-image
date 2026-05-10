import OpenAI from 'openai'
import {
  STUDIO_ENHANCE_SYSTEM,
  STUDIO_SURPRISE_SYSTEM,
  STUDIO_SURPRISE_USER_MESSAGE,
} from './promptAssistPrompts'

export type PromptAssistOk = { success: true, data: { text: string } }
export type PromptAssistErr = { success: false, error: string }
export type PromptAssistResult = PromptAssistOk | PromptAssistErr

function missingKeyError(context: string): PromptAssistErr {
  return {
    success: false,
    error: `OPENAI_API_KEY is not set. ${context}`,
  }
}

function resolvePromptModel(config: { openaiPromptModel?: string }): string {
  return String(config.openaiPromptModel || 'gpt-4o-mini').trim()
}

/** Studio **Enhance prompt** — rewrites the user prompt for clearer image generation. */
export async function runEnhancePrompt(
  config: { openaiApiKey?: string, openaiPromptModel?: string },
  prompt: string,
): Promise<PromptAssistResult> {
  const apiKey = config.openaiApiKey
  if (!apiKey || !String(apiKey).trim()) {
    return missingKeyError('Enhance prompt uses OpenAI text models.')
  }
  const trimmed = prompt.trim()
  if (!trimmed) {
    return { success: false, error: 'prompt is required.' }
  }

  const model = resolvePromptModel(config)

  try {
    const openai = new OpenAI({ apiKey: String(apiKey).trim() })
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: STUDIO_ENHANCE_SYSTEM },
        { role: 'user', content: trimmed },
      ],
      max_tokens: 800,
    })

    const text = response.choices[0]?.message?.content?.trim() ?? ''
    if (!text) {
      return { success: false, error: 'No text returned from the model.' }
    }

    return { success: true, data: { text } }
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to enhance prompt'
    console.error('[api/text/enhance-prompt]', e)
    return { success: false, error: msg }
  }
}

/** Studio **Surprise me** — generates a fresh prompt from scratch. */
export async function runSurprisePrompt(
  config: { openaiApiKey?: string, openaiPromptModel?: string },
): Promise<PromptAssistResult> {
  const apiKey = config.openaiApiKey
  if (!apiKey || !String(apiKey).trim()) {
    return missingKeyError('Surprise me uses OpenAI text models.')
  }

  const model = resolvePromptModel(config)

  try {
    const openai = new OpenAI({ apiKey: String(apiKey).trim() })
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: STUDIO_SURPRISE_SYSTEM },
        { role: 'user', content: STUDIO_SURPRISE_USER_MESSAGE },
      ],
      max_tokens: 500,
    })

    const text = response.choices[0]?.message?.content?.trim() ?? ''
    if (!text) {
      return { success: false, error: 'No text returned from the model.' }
    }

    return { success: true, data: { text } }
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate prompt'
    console.error('[api/text/surprise-prompt]', e)
    return { success: false, error: msg }
  }
}
