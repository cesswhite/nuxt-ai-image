<template>
  <div v-if="hasOutput"
    class="pointer-events-none fixed top-2 left-1/2 z-40 flex w-auto -translate-x-1/2 justify-center px-2">
    <UCard variant="subtle" :ui="{
      root: 'rounded-xl',
      body: 'p-1.5 sm:p-1.5 mt-0',
    }" class="pointer-events-auto w-full">
      <div class="flex items-center justify-center gap-1.5">
        <UTooltip text="Download image">
          <UButton color="neutral" variant="outline" square size="md" icon="i-lucide-download" class="cursor-pointer"
            :disabled="busy" aria-label="Download image" @click="onDownload" />
        </UTooltip>

        <UTooltip text="Regenerate with the same settings">
          <UButton color="neutral" variant="outline" square size="md" icon="i-lucide-refresh-cw" class="cursor-pointer"
            :disabled="busy" aria-label="Regenerate image" @click="onRegenerate" />
        </UTooltip>

        <UTooltip :text="editTooltip">
          <UButton :color="studio.referenceImages.length > 0 ? 'primary' : 'neutral'" variant="outline" square size="md"
            icon="i-lucide-pencil-line" class="cursor-pointer" :disabled="busy" aria-label="Edit with this image"
            @click="onEditWithImage" />
        </UTooltip>

        <UTooltip text="Delete this generation">
          <UButton color="neutral" variant="outline" square size="md" icon="i-lucide-trash-2" class="cursor-pointer"
            :disabled="busy" aria-label="Delete generation" @click="deleteOpen = true" />
        </UTooltip>
      </div>
    </UCard>

    <UModal v-model:open="deleteOpen" title="Delete image?"
      description="This removes the preview from the studio. You can generate a new image anytime.">
      <template #footer>
        <UButton label="Cancel" color="neutral" variant="outline" class="cursor-pointer" @click="deleteOpen = false" />
        <UButton label="Delete" color="error" variant="solid" class="cursor-pointer" @click="onConfirmDelete" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { downloadFilenameForDataUrl, downloadImageFromUrl } from '~/utils/studioImageOutput'

const studio = useStudioStore()
const toast = useToast()
const { generate } = useGenerateImage()

const deleteOpen = ref(false)

const hasOutput = computed(() => Boolean(studio.lastOutput?.trim()))
const busy = computed(() => studio.loading)

const editTooltip = computed(() => {
  if (studio.provider !== 'google-gemini') {
    return 'Edit thread · Gemini models only'
  }
  if (studio.referenceImages.length > 0) {
    return `${studio.referenceImages.length} reference(s) · generate to continue`
  }
  return 'Use this image in the next generation'
})

function onDownload() {
  const url = studio.lastOutput?.trim()
  if (!url) return
  try {
    downloadImageFromUrl(url, downloadFilenameForDataUrl(url))
  }
  catch {
    toast.add({ title: 'Download failed', color: 'error' })
  }
}

async function onRegenerate() {
  await generate()
}

function onEditWithImage() {
  if (!studio.lastOutput.trim()) return
  if (studio.provider !== 'google-gemini') {
    toast.add({
      title: 'Gemini models only',
      description: 'Reference editing is supported for Nanobanana models.',
      color: 'warning',
    })
    return
  }
  const added = studio.attachReferenceFromOutput()
  if (!added) {
    toast.add({
      title: 'Could not add reference',
      description: 'Check the model limit or remove an existing reference.',
      color: 'warning',
    })
    return
  }
  toast.add({
    title: 'Added to references',
    description: 'Adjust the prompt and generate to edit from this image.',
    color: 'info',
  })
}

function onConfirmDelete() {
  studio.clearGeneration()
  deleteOpen.value = false
  toast.add({ title: 'Image removed', color: 'neutral' })
}
</script>
