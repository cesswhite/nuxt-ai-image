<template>
  <div class="flex flex-col gap-1">
    <UTextarea
      v-model="draft"
      variant="outline"
      :rows="5"
      :maxlength="maxLength"
      placeholder="Describe your image: subject, setting, lighting, style…"
      class="w-full bg-transparent disabled:opacity-50"
      :disabled="busy"
      :ui="textareaUi"
      size="xs"
      @blur="flushToStore"
    />

    <div
      v-if="referenceImages.length > 0"
      class="scrollbar-hide flex gap-1.5 overflow-x-auto px-1.5"
    >
      <div
        v-for="(url, index) in referenceImages"
        :key="`${index}-${url.slice(0, 32)}`"
        class="group relative shrink-0"
      >
        <img
          :src="url"
          alt=""
          class="size-10 rounded-md object-cover ring-1 ring-default"
          width="40"
          height="40"
          loading="lazy"
          decoding="async"
        >
        <UButton
          type="button"
          color="neutral"
          variant="solid"
          size="xs"
          square
          icon="i-lucide-x"
          class="absolute -end-1 -top-1 size-4 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
          :aria-label="`Remove reference ${index + 1}`"
          @click="studio.removeReferenceImage(index)"
        />
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      :accept="accept"
      multiple
      @change="onReferenceFilesChange"
    >

    <div class="flex w-full items-center justify-between gap-2 px-1.5">
      <span class="select-none text-xxs tabular-nums" :class="counterToneClass">
        {{ charCount }}/{{ maxLength }}
        <span v-if="referenceImages.length > 0" class="text-dimmed">
          · {{ referenceImages.length }}/{{ referenceLimit }} ref
        </span>
      </span>
      <div class="flex items-center gap-1">
        <UTooltip :text="addImagesTooltip" :content="{ side: 'top' }" :delay-duration="0">
          <UButton
            type="button"
            variant="subtle"
            color="neutral"
            size="xs"
            square
            icon="i-lucide-images"
            class="cursor-pointer"
            :disabled="busy || !canAdd"
            :aria-label="addImagesTooltip"
            @click="openReferencePicker"
          />
        </UTooltip>
        <UTooltip text="Enhance prompt" :content="{ side: 'top' }" :delay-duration="0">
          <UButton
            type="button"
            variant="subtle"
            color="neutral"
            size="xs"
            square
            icon="i-lucide-sparkles"
            class="cursor-pointer"
            :disabled="busy || !canEnhance"
            :loading="loadingGpt"
            aria-label="Enhance prompt"
            @click="onEnhance"
          />
        </UTooltip>
        <UTooltip text="Surprise prompt" :content="{ side: 'top' }" :delay-duration="0">
          <UButton
            type="button"
            variant="subtle"
            color="neutral"
            size="xs"
            square
            icon="i-lucide-wand-2"
            class="cursor-pointer"
            :disabled="busy"
            :loading="loadingSurprise"
            aria-label="Surprise me with a random prompt"
            @click="onSurprise"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const maxLength = 4000
const warnAtChars = 3000

/** Static — avoids new `ui` object every render (UTextarea deep-watches props). */
const textareaUi = {
  base:
    'resize-none border-0 bg-transparent ring-0 focus:ring-0 focus:outline-none p-1.5 rounded-none shadow-none text-sm placeholder:text-dimmed max-h-40 focus-visible:ring-0 focus-visible:ring-offset-0',
} as const

const studio = useStudioStore()
const { loading, loadingGpt, loadingSurprise, referenceImages } = storeToRefs(studio)
const { handleEnhancePrompt, handleSurprisePrompt } = useStudioPromptAssist()
const {
  limit: referenceLimit,
  canAdd,
  accept,
  addImagesTooltip,
  addFilesFromInput,
} = useStudioReferenceImages()

const fileInputRef = ref<HTMLInputElement | null>(null)
const draft = ref(studio.prompt)
const charCount = computed(() => draft.value.length)

const counterToneClass = computed(() => {
  const n = charCount.value
  if (n >= maxLength) return 'text-error'
  if (n >= warnAtChars) return 'text-warning'
  return 'text-dark-950/30 dark:text-dark-50/30'
})
const busy = computed(() => loading.value || loadingGpt.value || loadingSurprise.value)
const canEnhance = computed(() => draft.value.trim().length > 0)

let syncTimer: ReturnType<typeof setTimeout> | undefined

function flushToStore() {
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = undefined
  }
  if (studio.prompt !== draft.value) {
    studio.setPrompt(draft.value)
  }
}

function scheduleSyncToStore() {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(flushToStore, 120)
}

function openReferencePicker() {
  fileInputRef.value?.click()
}

function onReferenceFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  void addFilesFromInput(input.files)
  input.value = ''
}

watch(draft, () => {
  scheduleSyncToStore()
})

watch(
  () => studio.prompt,
  (next) => {
    if (next !== draft.value) draft.value = next
  },
)

async function onEnhance() {
  flushToStore()
  await handleEnhancePrompt()
}

async function onSurprise() {
  flushToStore()
  await handleSurprisePrompt()
}

onBeforeUnmount(() => {
  flushToStore()
  if (syncTimer) clearTimeout(syncTimer)
})

defineExpose({ flushToStore })
</script>
