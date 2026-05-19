import { isGptImage2Model } from '~/utils/openAiImagePresets'
import { parseStopSequencesFromRaw } from '~/utils/geminiImageUtils'
import { postUrlForImageModel } from '~/utils/imageApiRoutes'
import { STUDIO_IMAGE_MODEL } from '~/utils/studioImageModels'

export interface GenerateImageResponse {
  output: string
  provider: string
  model: string
}

export function useGenerateImage() {
  const studio = useStudioStore()
  const toast = useToast()

  function geminiReferenceFields(): Record<string, unknown> {
    if (studio.provider !== 'google-gemini' || studio.referenceImages.length === 0) {
      return {}
    }
    return { reference_image_data_urls: [...studio.referenceImages] }
  }

  async function generate() {
    if (!studio.prompt.trim()) {
      toast.add({ title: 'Add a prompt', color: 'warning' })
      return
    }
    studio.setError(null)
    studio.setLoading(true)
    try {
      const model = studio.model
      const url = postUrlForImageModel(model)

      let body: Record<string, unknown>

      if (studio.provider === 'openai' && model === STUDIO_IMAGE_MODEL.GPT_IMAGE_15) {
        body = {
          prompt: studio.prompt,
          aspect_ratio: studio.aspectRatio,
          openai_quality: studio.openAiQuality,
        }
      }
      else if (studio.provider === 'openai' && model === STUDIO_IMAGE_MODEL.GPT_IMAGE_2) {
        body = {
          prompt: studio.prompt,
          openai_size: studio.openAiGptImage2Size,
          openai_quality: studio.openAiQuality,
        }
      }
      else if (studio.provider === 'google-gemini' && model === STUDIO_IMAGE_MODEL.NANOBANANA_25) {
        body = {
          prompt: studio.prompt,
          aspect_ratio: studio.aspectRatio,
          ...geminiReferenceFields(),
          nanobanana_25: {
            system_instruction: studio.nanobanana25SystemInstruction.trim() || undefined,
            temperature: studio.nanobanana25Temperature,
            stop_sequences: parseStopSequencesFromRaw(studio.nanobanana25StopSequencesRaw),
            max_output_tokens: studio.nanobanana25MaxOutputTokens,
            top_p: studio.nanobanana25TopP,
          },
        }
      }
      else if (studio.provider === 'google-gemini' && model === STUDIO_IMAGE_MODEL.NANOBANANA2) {
        body = {
          prompt: studio.prompt,
          aspect_ratio: studio.aspectRatio,
          ...geminiReferenceFields(),
          output_format: studio.nanobanana2OutputFormat,
          temperature: studio.nanobanana2Temperature,
          image_size: studio.nanobanana2ImageSize,
          grounding_web: studio.nanobanana2GroundingWeb,
          grounding_image_search: studio.nanobanana2GroundingImageSearch,
          stop_sequences: parseStopSequencesFromRaw(studio.nanobanana2StopSequencesRaw),
          max_output_tokens: studio.nanobanana2MaxOutputTokens,
          top_p: studio.nanobanana2TopP,
          ...(studio.nanobanana2ThinkingLevel !== 'default'
            ? { thinking_level: studio.nanobanana2ThinkingLevel }
            : {}),
        }
      }
      else if (studio.provider === 'google-gemini' && model === STUDIO_IMAGE_MODEL.NANOBANANA_PRO) {
        body = {
          prompt: studio.prompt,
          aspect_ratio: studio.aspectRatio,
          ...geminiReferenceFields(),
          nanobanana_pro: {
            system_instruction: studio.nanobananaProSystemInstruction.trim() || undefined,
            temperature: studio.nanobananaProTemperature,
            image_size: studio.nanobananaProImageSize,
            grounding_web: studio.nanobananaProGroundingWeb,
            stop_sequences: parseStopSequencesFromRaw(studio.nanobananaProStopSequencesRaw),
            max_output_tokens: studio.nanobananaProMaxOutputTokens,
            top_p: studio.nanobananaProTopP,
          },
        }
      }
      else {
        throw new Error(`Unsupported provider/model combination: ${studio.provider} / ${model}`)
      }

      const res = await $fetch<GenerateImageResponse>(url, {
        method: 'POST',
        body,
      })
      studio.setOutput(res.output)
      toast.add({ title: 'Image ready', color: 'success' })
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
