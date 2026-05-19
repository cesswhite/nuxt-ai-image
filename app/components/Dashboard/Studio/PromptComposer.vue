<template>
  <div class="flex flex-col gap-1">
    <UTextarea v-model="draft" variant="outline" :rows="5" :maxlength="maxLength"
      placeholder="Describe your image: subject, setting, lighting, style…"
      class="w-full bg-transparent disabled:opacity-50" :disabled="busy" :ui="textareaUi" @blur="flushToStore"
      size="xs" />
    <div class="flex w-full items-center justify-between gap-2 px-1.5">
      <span class=" select-none text-xxs tabular-nums" :class="counterToneClass">
        {{ charCount }}/{{ maxLength }}
      </span>
      <div class="flex items-center gap-1 ">
        <UTooltip text="Enhance prompt" :content="{ side: 'top' }" :delay-duration="0" size="xs">
          <UButton type="button" variant="subtle" color="neutral" size="xs" square icon="i-lucide-sparkles"
            class="cursor-pointer" :disabled="busy || !canEnhance" :loading="loadingGpt" aria-label="Enhance prompt"
            @click="onEnhance" />
        </UTooltip>
        <UTooltip text="Surprise prompt" :content="{ side: 'top' }" :delay-duration="0">
          <UButton type="button" variant="subtle" color="neutral" size="xs" square icon="i-lucide-wand-2"
            class="cursor-pointer" :disabled="busy" :loading="loadingSurprise"
            aria-label="Surprise me with a random prompt" @click="onSurprise" />
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
const { loading, loadingGpt, loadingSurprise } = storeToRefs(studio)

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

const { handleEnhancePrompt, handleSurprisePrompt } = useStudioPromptAssist()

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

watch(draft, () => {
  scheduleSyncToStore()
})

/** External updates (enhance / surprise / reset). */
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

/** Call before generate so the store has the latest text. */
defineExpose({ flushToStore })
</script>
