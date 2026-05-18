import {
  allowedGeminiAspectRatiosForModel,
  isAllowedGeminiAspectForModel,
} from '~/utils/geminiAspectRatios'
import {
  defaultModelForProvider,
  isAllowedStudioModel,
  STUDIO_IMAGE_MODEL,
} from '~/utils/studioImageModels'

/** Keeps `model` and Gemini `aspectRatio` valid when provider or model changes. */
export function useStudioInputsSync() {
  const studio = useStudioStore()

  watch(
    () => studio.provider,
    (p) => {
      if (!isAllowedStudioModel(p, studio.model)) {
        studio.model = defaultModelForProvider(p)
      }
    },
  )

  watch(
    () => studio.model,
    (model, previous) => {
      if (studio.provider !== 'google-gemini') return
      if (
        (
          model === STUDIO_IMAGE_MODEL.NANOBANANA_PRO
          || model === STUDIO_IMAGE_MODEL.NANOBANANA_25
        )
        && previous
        && previous !== model
      ) {
        studio.aspectRatio = 'auto'
      }
    },
  )

  watch(
    () => [studio.provider, studio.model, studio.aspectRatio] as const,
    () => {
      if (studio.provider !== 'google-gemini') return
      if (!isAllowedGeminiAspectForModel(studio.model, studio.aspectRatio)) {
        const allowed = allowedGeminiAspectRatiosForModel(studio.model)
        studio.aspectRatio = allowed.includes('auto') ? 'auto' : '1:1'
      }
    },
  )
}
