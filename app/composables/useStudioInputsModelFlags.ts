import { STUDIO_IMAGE_MODEL } from '~/utils/studioImageModels'

/**
 * Derived visibility flags for studio inputs (which model-specific block to show).
 */
export function useStudioInputsModelFlags() {
  const studio = useStudioStore()

  const isNanobanana2 = computed(
    () =>
      studio.provider === 'google-gemini'
      && studio.model === STUDIO_IMAGE_MODEL.NANOBANANA2,
  )

  const isNanobananaPro = computed(
    () =>
      studio.provider === 'google-gemini'
      && studio.model === STUDIO_IMAGE_MODEL.NANOBANANA_PRO,
  )

  const isNanobanana25 = computed(
    () =>
      studio.provider === 'google-gemini'
      && studio.model === STUDIO_IMAGE_MODEL.NANOBANANA_25,
  )

  const isOpenAi15 = computed(
    () =>
      studio.provider === 'openai'
      && studio.model === STUDIO_IMAGE_MODEL.GPT_IMAGE_15,
  )

  const isOpenAi2 = computed(
    () =>
      studio.provider === 'openai'
      && studio.model === STUDIO_IMAGE_MODEL.GPT_IMAGE_2,
  )

  return {
    isNanobanana2,
    isNanobananaPro,
    isNanobanana25,
    isOpenAi15,
    isOpenAi2,
  }
}
