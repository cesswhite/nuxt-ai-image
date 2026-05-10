export interface GenerateImageResponse {
  output: string
  provider: string
  model: string
  demo?: boolean
}

export function useGenerateImage() {
  const studio = useStudioStore()
  const toast = useToast()

  async function generate() {
    if (!studio.prompt.trim()) {
      toast.add({ title: 'Add a prompt', color: 'warning' })
      return
    }
    studio.setError(null)
    studio.setLoading(true)
    try {
      const res = await $fetch<GenerateImageResponse>('/api/generate-image', {
        method: 'POST',
        body: {
          prompt: studio.prompt,
          provider: studio.provider,
          model: studio.model,
          aspect_ratio: studio.aspectRatio,
        },
      })
      studio.setOutput(res.output)
      if (res.demo) {
        toast.add({
          title: 'Demo image',
          description: 'Replace server/api/generate-image.post.ts with your provider SDK calls.',
          color: 'info',
        })
      }
      else {
        toast.add({ title: 'Image ready', color: 'success' })
      }
    }
    catch (e: unknown) {
      let msg = 'Generation failed'
      if (e && typeof e === 'object') {
        const fe = e as { data?: { message?: string }, message?: string }
        msg = fe.data?.message ?? fe.message ?? msg
      }
      else if (e instanceof Error) {
        msg = e.message
      }
      studio.setError(msg)
      toast.add({ title: 'Generation failed', description: msg, color: 'error' })
    }
    finally {
      studio.setLoading(false)
    }
  }

  return { generate }
}
