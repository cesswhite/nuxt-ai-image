import OpenAI from 'openai'
import {
  STUDIO_ENHANCE_SYSTEM,
  STUDIO_SURPRISE_SYSTEM,
  STUDIO_SURPRISE_USER_MESSAGE,
} from './promptAssistPrompts'

export type PromptAssistOk = { success: true, data: { text: string } }
export type PromptAssistErr = { success: false, error: string }
export type PromptAssistResult = PromptAssistOk | PromptAssistErr

type OpenAiRuntimeConfig = { openaiApiKey?: string, openaiPromptModel?: string }

function missingKeyError(context: string): PromptAssistErr {
  return {
    success: false,
    error: `OPENAI_API_KEY is not set. ${context}`,
  }
}

function resolvePromptModel(config: OpenAiRuntimeConfig): string {
  return String(config.openaiPromptModel || 'gpt-4o-mini').trim()
}

async function runOpenAiTextCompletion(
  config: OpenAiRuntimeConfig,
  options: {
    context: string
    system: string
    user: string
    maxTokens: number
    logLabel: string
    emptyError: string
    failureMessage: string
  },
): Promise<PromptAssistResult> {
  const apiKey = config.openaiApiKey
  if (!apiKey || !String(apiKey).trim()) {
    return missingKeyError(options.context)
  }

  try {
    const openai = new OpenAI({ apiKey: String(apiKey).trim() })
    const response = await openai.chat.completions.create({
      model: resolvePromptModel(config),
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
      max_tokens: options.maxTokens,
    })

    const text = response.choices[0]?.message?.content?.trim() ?? ''
    if (!text) {
      return { success: false, error: options.emptyError }
    }

    return { success: true, data: { text } }
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : options.failureMessage
    console.error(options.logLabel, e)
    return { success: false, error: msg }
  }
}

export async function runEnhancePrompt(
  config: OpenAiRuntimeConfig,
  prompt: string,
): Promise<PromptAssistResult> {
  const trimmed = prompt.trim()
  if (!trimmed) {
    return { success: false, error: 'prompt is required.' }
  }

  return runOpenAiTextCompletion(config, {
    context: 'Enhance prompt uses OpenAI text models.',
    system: STUDIO_ENHANCE_SYSTEM,
    user: trimmed,
    maxTokens: 800,
    logLabel: '[api/text/enhance-prompt]',
    emptyError: 'No text returned from the model.',
    failureMessage: 'Failed to enhance prompt',
  })
}

export async function runSurprisePrompt(
  config: OpenAiRuntimeConfig,
): Promise<PromptAssistResult> {
  return runOpenAiTextCompletion(config, {
    context: 'Surprise me uses OpenAI text models.',
    system: STUDIO_SURPRISE_SYSTEM,
    user: STUDIO_SURPRISE_USER_MESSAGE,
    maxTokens: 500,
    logLabel: '[api/text/surprise-prompt]',
    emptyError: 'No text returned from the model.',
    failureMessage: 'Failed to generate prompt',
  })
}
