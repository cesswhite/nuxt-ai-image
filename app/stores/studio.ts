import { acceptHMRUpdate, defineStore } from 'pinia'

export type StudioProvider = 'openai' | 'google-gemini'

export const useStudioStore = defineStore('studio', {
  state: () => ({
    prompt: 'A minimal product hero shot, soft daylight, neutral background.',
    provider: 'google-gemini' as StudioProvider,
    aspectRatio: '1:1',
    model: 'gemini-2.5-flash-image',
    lastOutput: '' as string,
    loading: false,
    error: '' as string | null,
  }),
  actions: {
    setLoading(v: boolean) {
      this.loading = v
    },
    setError(msg: string | null) {
      this.error = msg
    },
    setOutput(url: string) {
      this.lastOutput = url
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStudioStore, import.meta.hot))
}
