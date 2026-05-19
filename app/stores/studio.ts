import { acceptHMRUpdate, defineStore } from 'pinia'
import type { OpenAiImageQuality } from '~/utils/openAiImagePresets'
import {
  NANOBANANA2_DEFAULTS,
  type Nanobanana2ImageSize,
  type Nanobanana2OutputFormat,
  type Nanobanana2ThinkingLevel,
} from '~/utils/gemini31Nanobanana2'
import {
  NANOBANANA_PRO_DEFAULTS,
  type NanobananaProImageSize,
} from '~/utils/geminiProNanobanana'
import { NANOBANANA_25_DEFAULTS } from '~/utils/gemini25Nanobanana'
import {
  maxReferenceImagesForModel,
  supportsReferenceImages,
  trimReferenceImagesForModel,
  validateReferenceDataUrl,
} from '~/utils/studioReferenceImages'

import type { StudioProvider } from '~/types/studio'

export type { StudioProvider }

/** Studio-only: omit `thinking_level` in API body when `'default'`. */
export type Nanobanana2ThinkingUi = 'default' | Nanobanana2ThinkingLevel

export const useStudioStore = defineStore('studio', {
  state: () => ({
    prompt: 'A minimal product hero shot, soft daylight, neutral background.',
    provider: 'google-gemini' as StudioProvider,
    aspectRatio: '1:1',
    /** Used when OpenAI model is `gpt-image-2` (`size` API param). */
    openAiGptImage2Size: '1024x1024',
    /** GPT Image `quality`: low / medium / high / auto (OpenAI provider only). */
    openAiQuality: 'auto' as OpenAiImageQuality,
    model: 'gemini-3.1-flash-image-preview',
    /** Nanobanana 2 only — `gemini-3.1-flash-image-preview` (AI Studio parity). */
    nanobanana2OutputFormat: NANOBANANA2_DEFAULTS.outputFormat as Nanobanana2OutputFormat,
    nanobanana2Temperature: NANOBANANA2_DEFAULTS.temperature,
    nanobanana2ImageSize: NANOBANANA2_DEFAULTS.imageSize as Nanobanana2ImageSize,
    nanobanana2GroundingWeb: NANOBANANA2_DEFAULTS.groundingWeb,
    nanobanana2GroundingImageSearch: NANOBANANA2_DEFAULTS.groundingImageSearch,
    /** Split into `stop_sequences` on send (newline / comma / pipe). */
    nanobanana2StopSequencesRaw: NANOBANANA2_DEFAULTS.stopSequencesRaw,
    nanobanana2MaxOutputTokens: NANOBANANA2_DEFAULTS.maxOutputTokens as number,
    nanobanana2TopP: NANOBANANA2_DEFAULTS.topP as number,
    /** When not `default`, sends flat `thinking_level` on the Gemini 3.1 image POST body. */
    nanobanana2ThinkingLevel: 'default' as Nanobanana2ThinkingUi,
    /** Nanobanana Pro — `gemini-3-pro-image-preview` (AI Studio run settings). */
    nanobananaProSystemInstruction: NANOBANANA_PRO_DEFAULTS.systemInstruction,
    nanobananaProTemperature: NANOBANANA_PRO_DEFAULTS.temperature,
    nanobananaProImageSize: NANOBANANA_PRO_DEFAULTS.imageSize as NanobananaProImageSize,
    nanobananaProGroundingWeb: NANOBANANA_PRO_DEFAULTS.groundingWeb,
    nanobananaProStopSequencesRaw: NANOBANANA_PRO_DEFAULTS.stopSequencesRaw,
    nanobananaProMaxOutputTokens: NANOBANANA_PRO_DEFAULTS.maxOutputTokens as number,
    nanobananaProTopP: NANOBANANA_PRO_DEFAULTS.topP as number,
    /** Nanobanana — `gemini-2.5-flash-image` (AI Studio: no resolution / grounding). */
    nanobanana25SystemInstruction: NANOBANANA_25_DEFAULTS.systemInstruction,
    nanobanana25Temperature: NANOBANANA_25_DEFAULTS.temperature,
    nanobanana25StopSequencesRaw: NANOBANANA_25_DEFAULTS.stopSequencesRaw,
    nanobanana25MaxOutputTokens: NANOBANANA_25_DEFAULTS.maxOutputTokens as number,
    nanobanana25TopP: NANOBANANA_25_DEFAULTS.topP as number,
    lastOutput: '' as string,
    /** Gemini reference images (data URLs) sent on the next generate. */
    referenceImages: [] as string[],
    loading: false,
    loadingGpt: false,
    loadingSurprise: false,
    error: '' as string | null,
  }),
  actions: {
    setPrompt(text: string) {
      this.prompt = text
    },
    setLoadingGpt(v: boolean) {
      this.loadingGpt = v
    },
    setLoadingSurprise(v: boolean) {
      this.loadingSurprise = v
    },
    setLoading(v: boolean) {
      this.loading = v
    },
    setError(msg: string | null) {
      this.error = msg
    },
    setOutput(url: string) {
      this.lastOutput = url
    },
    addReferenceImages(urls: string[]) {
      if (!supportsReferenceImages(this.model)) return 0
      const max = maxReferenceImagesForModel(this.model)
      let added = 0
      for (const raw of urls) {
        if (this.referenceImages.length >= max) break
        const url = raw.trim()
        if (!url) continue
        const check = validateReferenceDataUrl(url)
        if (!check.ok) continue
        if (this.referenceImages.includes(url)) continue
        this.referenceImages.push(url)
        added++
      }
      return added
    },
    removeReferenceImage(index: number) {
      if (index < 0 || index >= this.referenceImages.length) return
      this.referenceImages.splice(index, 1)
    },
    clearReferenceImages() {
      this.referenceImages = []
    },
    trimReferenceImagesToModel() {
      this.referenceImages = trimReferenceImagesForModel(this.referenceImages, this.model)
    },
    attachReferenceFromOutput() {
      if (!this.lastOutput.trim()) return false
      return this.addReferenceImages([this.lastOutput]) > 0
    },
    clearGeneration() {
      this.lastOutput = ''
      this.error = null
      this.clearReferenceImages()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStudioStore, import.meta.hot))
}
