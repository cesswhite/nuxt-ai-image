<template>
  <div
    class="pointer-events-none fixed bottom-2 left-1/2 z-20 flex w-auto -translate-x-1/2 flex-col items-center gap-1.5 px-2">
    <UCard v-show="!collapsed" id="studio-composer-panel" variant="subtle" :ui="{
      root: 'rounded-xl',
      body: 'p-1.5 sm:p-1.5 mt-0',
    }" class="pointer-events-auto w-full">
      <div class="flex flex-col">
        <div class="mb-1 w-full">
          <DashboardStudioPromptComposer ref="promptComposerRef" />
        </div>
        <div class="flex items-center justify-between gap-x-1">
          <div class="flex flex-col justify-start gap-2 px-1">
            <span class="text-xxs text-dark-950/30 dark:text-dark-50/30">
              Provider & Model
            </span>
            <div class="flex items-center justify-start gap-x-1">
              <DashboardStudioFieldDropdown v-model="studio.provider" :items="providerMenuItems"
                :disabled="studio.loading" placeholder="Provider…" :tooltip="providerTooltip" :block="false"
                button-class="" />
              <DashboardStudioFieldDropdown v-model="studio.model" :items="modelItems" :disabled="studio.loading"
                placeholder="Model…" :tooltip="modelTooltip" :block="false" button-class="" />

            </div>
          </div>

          <div class="flex flex-col justify-start gap-2 px-1.5">
            <span class="text-xxs text-dark-950/30 dark:text-dark-50/30">
              Configuration
            </span>
            <div class="flex items-center justify-start gap-x-1">
              <DashboardStudioFieldDropdown v-if="studio.provider === 'google-gemini' && isNanobanana2"
                v-model="studio.aspectRatio" :items="geminiAspectItems" :disabled="studio.loading" placeholder="Ratio…"
                :tooltip="aspectTooltip" :block="false" button-class="" />
              <DashboardStudioPanelModelsNanobanana2Form v-if="isNanobanana2" />
              <DashboardStudioPanelModelsNanobananaProForm v-if="isNanobananaPro" />
              <DashboardStudioPanelModelsNanobanana25Form v-if="isNanobanana25" />
              <DashboardStudioPanelModelsOpenaiForm :is-open-ai15="isOpenAi15" :is-open-ai2="isOpenAi2" />
            </div>
          </div>

        </div>
        <div class="flex w-full items-center justify-end gap-2 px-1.5">
          <!-- <UButton variant="outline" color="neutral" size="lg" class="cursor-pointer" block
            :disabled="!studio.lastOutput" @click="clearOutput">
            Clear result
          </UButton> -->
          <UButton variant="solid" color="primary" class="cursor-pointer" icon="i-lucide-send" size="lg" square
            :loading="studio.loading" @click="onGenerate" />
        </div>
      </div>
    </UCard>

    <div class="pointer-events-auto flex justify-center">
      <UButton variant="soft" color="neutral" size="md" class="cursor-pointer" :icon="toggleIcon"
        :loading="studio.loading" :disabled="studio.loading" aria-controls="studio-composer-panel"
        :aria-expanded="!collapsed" @click="onToggleCollapsed" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudioFieldDropdownItem } from '~/components/Dashboard/Studio/FieldDropdown.vue'
import {
  studioModelSelectItems,
  studioProviderSelectItems,
} from '~/utils/studioImageModels'
import { geminiAspectSelectItemsForModel } from '~/utils/geminiImageUtils'

const studio = useStudioStore()
const collapsed = ref(false)
const promptComposerRef = ref<{ flushToStore: () => void } | null>(null)

const toggleLabel = computed(() => {
  if (studio.loading) return 'Generating image'
  if (collapsed.value) return 'Expand'
  return 'Collapse'
})

const toggleIcon = computed(() => {
  if (studio.loading) return undefined
  return collapsed.value ? 'i-lucide-maximize' : 'i-lucide-minimize'
})

watch(
  () => studio.loading,
  (loading, wasLoading) => {
    if (loading) {
      collapsed.value = true
    }
    else if (wasLoading) {
      collapsed.value = false
    }
  },
)

function onToggleCollapsed() {
  if (studio.loading) return
  collapsed.value = !collapsed.value
}

const { generate } = useGenerateImage()

const {
  isNanobanana2,
  isNanobananaPro,
  isNanobanana25,
  isOpenAi15,
  isOpenAi2,
} = useStudioInputsModelFlags()

useStudioInputsSync()

function clearOutput() {
  studio.setOutput('')
  studio.setError(null)
}

async function onGenerate() {
  promptComposerRef.value?.flushToStore()
  await generate()
}

/** Keys for v-memo — exclude `prompt` so typing does not re-render model forms. */
const controlsMemoKey = computed(() =>
  [studio.provider, studio.model, studio.aspectRatio, studio.loading, isNanobanana2.value].join('|'),
)

const geminiAspectItems = computed<StudioFieldDropdownItem[]>(() =>
  geminiAspectSelectItemsForModel(studio.model).map((row) => ({
    ...row,
    icon: 'i-lucide-ratio',
  })),
)

const providerMenuItems = studioProviderSelectItems('composer')
const modelItems = computed(() => studioModelSelectItems(studio.provider))

function itemLabel<T extends { label: string, value: string }>(
  items: T[],
  value: string,
) {
  return items.find((i) => i.value === value)?.label ?? value
}

const providerTooltip = computed(
  () => `Provider · ${itemLabel(providerMenuItems, studio.provider)}`,
)

const modelTooltip = computed(
  () => `Model · ${itemLabel(modelItems.value, studio.model)}`,
)

const aspectTooltip = computed(() => `Aspect · ${studio.aspectRatio}`)
</script>
