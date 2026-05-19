import {
  allowedGeminiAspectRatiosForModel,
  isAllowedGeminiAspectForModel,
} from '~/utils/geminiImageUtils'
import {
  defaultModelForProvider,
  isAllowedStudioModel,
  STUDIO_IMAGE_MODEL,
} from '~/utils/studioImageModels'
import { maxReferenceImagesForModel } from '~/utils/studioReferenceImages'

/** Keeps `model` and Gemini `aspectRatio` valid when provider or model changes. */
export function useStudioInputsSync() {
  const studio = useStudioStore()
  const toast = useToast()

  watch(
    () => studio.provider,
    (p) => {
      if (!isAllowedStudioModel(p, studio.model)) {
        studio.model = defaultModelForProvider(p)
      }
      const before = studio.referenceImages.length
      studio.trimReferenceImagesToModel()
      if (before > studio.referenceImages.length) {
        toast.add({
          title: 'References cleared',
          description: 'Reference images are only supported on Gemini models.',
          color: 'warning',
        })
      }
    },
  )

  watch(
    () => studio.model,
    (model, previous) => {
      const before = studio.referenceImages.length
      studio.trimReferenceImagesToModel()
      if (before > studio.referenceImages.length) {
        const max = maxReferenceImagesForModel(model)
        toast.add({
          title: 'References trimmed',
          description: `This model allows up to ${max} reference image(s).`,
          color: 'warning',
        })
      }

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
