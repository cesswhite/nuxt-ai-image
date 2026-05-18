import type { TextAssistResult } from '~/types/textAssist'
import { TEXT_API_ENHANCE_PROMPT, TEXT_API_SURPRISE_PROMPT } from '~/utils/textApiRoutes'

function assistErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const msg = (e as { data?: { message?: string } }).data?.message
    if (msg) return String(msg)
  }
  if (e instanceof Error) return e.message
  return 'Request failed'
}

export function useStudioPromptAssist() {
  const studio = useStudioStore()
  const toast = useToast()

  async function handleEnhancePrompt() {
    if (!studio.prompt.trim()) return
    studio.setLoadingGpt(true)
    studio.setError(null)
    try {
      const res = await $fetch<TextAssistResult>(TEXT_API_ENHANCE_PROMPT, {
        method: 'POST',
        body: { prompt: studio.prompt },
      })
      if (res.success && res.data?.text) {
        studio.setPrompt(res.data.text.trim())
        toast.add({ title: 'Prompt enhanced', color: 'success' })
      }
      else {
        const msg = !res.success && 'error' in res ? (res.error ?? 'Try again') : 'Try again'
        toast.add({ title: 'Enhance failed', description: msg, color: 'error' })
        studio.setError(msg)
      }
    }
    catch (e: unknown) {
      const msg = assistErrorMessage(e)
      toast.add({ title: 'Enhance failed', description: msg, color: 'error' })
      studio.setError(msg)
    }
    finally {
      studio.setLoadingGpt(false)
    }
  }

  async function handleSurprisePrompt() {
    studio.setLoadingSurprise(true)
    studio.setError(null)
    try {
      const res = await $fetch<TextAssistResult>(TEXT_API_SURPRISE_PROMPT, {
        method: 'POST',
      })
      if (res.success && res.data?.text) {
        studio.setPrompt(res.data.text.trim())
        toast.add({
          title: 'Prompt ready',
          description: 'A new idea was generated.',
          color: 'success',
        })
      }
      else {
        const msg = !res.success && 'error' in res ? (res.error ?? 'Try again') : 'Try again'
        toast.add({ title: 'Surprise failed', description: msg, color: 'error' })
        studio.setError(msg)
      }
    }
    catch (e: unknown) {
      const msg = assistErrorMessage(e)
      toast.add({ title: 'Surprise failed', description: msg, color: 'error' })
      studio.setError(msg)
    }
    finally {
      studio.setLoadingSurprise(false)
    }
  }

  return {
    handleEnhancePrompt,
    handleSurprisePrompt,
  }
}
