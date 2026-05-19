import {
  maxReferenceImagesForModel,
  readImageFileAsDataUrl,
  referenceImageAcceptAttribute,
  supportsReferenceImages,
  validateReferenceDataUrl,
} from '~/utils/studioReferenceImages'

export function useStudioReferenceImages() {
  const studio = useStudioStore()
  const toast = useToast()

  const limit = computed(() => maxReferenceImagesForModel(studio.model))
  const count = computed(() => studio.referenceImages.length)
  const canAdd = computed(() => supportsReferenceImages(studio.model) && count.value < limit.value)
  const accept = referenceImageAcceptAttribute()

  const addImagesTooltip = computed(() => {
    if (!supportsReferenceImages(studio.model)) {
      return 'Reference images · Gemini models only'
    }
    return `Add reference images (${count.value}/${limit.value})`
  })

  async function addFilesFromInput(files: FileList | File[] | null | undefined) {
    if (!files?.length) return
    if (!supportsReferenceImages(studio.model)) {
      toast.add({
        title: 'Gemini models only',
        description: 'Reference images work with Nanobanana models.',
        color: 'warning',
      })
      return
    }

    const remaining = limit.value - count.value
    if (remaining <= 0) {
      toast.add({
        title: 'Reference limit reached',
        description: `This model allows up to ${limit.value} reference image(s).`,
        color: 'warning',
      })
      return
    }

    const toRead = Array.from(files).slice(0, remaining)
    const dataUrls: string[] = []
    const errors: string[] = []

    for (const file of toRead) {
      try {
        const dataUrl = await readImageFileAsDataUrl(file)
        const check = validateReferenceDataUrl(dataUrl)
        if (!check.ok) {
          errors.push(check.error)
          continue
        }
        dataUrls.push(dataUrl)
      }
      catch {
        errors.push(`Could not read ${file.name}.`)
      }
    }

    const added = studio.addReferenceImages(dataUrls)
    if (added > 0) {
      toast.add({
        title: added === 1 ? 'Reference added' : `${added} references added`,
        color: 'success',
      })
    }
    if (errors.length) {
      toast.add({
        title: 'Some images skipped',
        description: errors[0],
        color: 'warning',
      })
    }
    if (files.length > toRead.length) {
      toast.add({
        title: 'Reference limit reached',
        description: `Only ${limit.value} image(s) allowed for this model.`,
        color: 'warning',
      })
    }
  }

  return {
    limit,
    count,
    canAdd,
    accept,
    addImagesTooltip,
    addFilesFromInput,
  }
}
