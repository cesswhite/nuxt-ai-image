<template>
  <div class="flex items-center justify-start gap-2">
    <DashboardStudioFieldDropdown v-model="studio.nanobanana2OutputFormat" :items="formatItems"
      :disabled="studio.loading" icon="i-lucide-gallery-horizontal" placeholder="Output format…"
      :tooltip="formatTooltip" />
    <DashboardStudioSliderFieldDropdown v-model="studio.nanobanana2Temperature" :disabled="studio.loading"
      icon="i-lucide-thermometer" placeholder="Temperature…" tooltip="Creativity (0–1)" />
    <DashboardStudioFieldDropdown v-model="studio.nanobanana2ImageSize" :items="resolutionItems"
      :disabled="studio.loading" icon="i-lucide-maximize-2" placeholder="Resolution…" :tooltip="resolutionTooltip" />
    <DashboardStudioContentFieldDropdown :disabled="studio.loading" icon="i-lucide-globe" placeholder="Grounding…"
      :tooltip="groundingTooltip" content-ui="w-52 p-3">
      <div class="flex flex-col gap-2">
        <USwitch v-model="studio.nanobanana2GroundingWeb" label="Google Search" />
        <USwitch v-model="studio.nanobanana2GroundingImageSearch" label="Image search" />
      </div>
    </DashboardStudioContentFieldDropdown>
    <DashboardStudioContentFieldDropdown :disabled="studio.loading" icon="i-lucide-circle-stop"
      placeholder="Stop sequences…" tooltip="Stop strings · , | or newline" content-ui="w-52 p-3">
      <UInput v-model="studio.nanobanana2StopSequencesRaw" variant="outline" placeholder="Add stop…" class="w-full"
        :disabled="studio.loading" />
    </DashboardStudioContentFieldDropdown>
    <DashboardStudioContentFieldDropdown :disabled="studio.loading" icon="i-lucide-hash" placeholder="Output length…"
      tooltip="Max output tokens" content-ui="w-52 p-3">
      <UInput v-model.number="studio.nanobanana2MaxOutputTokens" type="number" variant="outline" :min="1" :max="65536"
        step="1" class="w-full tabular-nums" :disabled="studio.loading" @blur="clampMaxOutputTokens" />
    </DashboardStudioContentFieldDropdown>
    <DashboardStudioSliderFieldDropdown v-model="studio.nanobanana2TopP" :disabled="studio.loading"
      icon="i-lucide-percent" placeholder="Top P…" tooltip="Top P (0–1)" :step="STUDIO_TOP_P_STEP" />
    <DashboardStudioFieldDropdown v-model="studio.nanobanana2ThinkingLevel" :items="thinkingItems"
      :disabled="studio.loading" icon="i-lucide-brain" placeholder="Thinking level…" :tooltip="thinkingTooltip" />
  </div>
</template>

<script setup lang="ts">
import type { Nanobanana2ThinkingUi } from '~/stores/studio'
import { NANOBANANA2_DEFAULTS, NANOBANANA2_IMAGE_SIZES } from '~/utils/gemini31Nanobanana2'
import {
  clampStudioMaxOutputTokens,
  clampStudioTopP,
  STUDIO_TOP_P_STEP,
} from '~/utils/geminiImageUtils'

const studio = useStudioStore()

function itemLabel<T extends { label: string, value: string | number }>(
  items: T[],
  value: string | number,
) {
  return items.find((i) => i.value === value)?.label ?? String(value)
}

const formatTooltip = computed(
  () => `Format · ${itemLabel(formatItems, studio.nanobanana2OutputFormat)}`,
)

const resolutionTooltip = computed(
  () => `Resolution · ${studio.nanobanana2ImageSize}`,
)

const groundingTooltip = computed(() => {
  const on: string[] = []
  if (studio.nanobanana2GroundingWeb) on.push('web')
  if (studio.nanobanana2GroundingImageSearch) on.push('images')
  return `Grounding · ${on.length === 0 ? 'off' : on.join(', ')}`
})

const thinkingTooltip = computed(
  () => `Reasoning · ${itemLabel(thinkingItems, studio.nanobanana2ThinkingLevel)}`,
)

function clampMaxOutputTokens() {
  studio.nanobanana2MaxOutputTokens = clampStudioMaxOutputTokens(
    studio.nanobanana2MaxOutputTokens,
    NANOBANANA2_DEFAULTS.maxOutputTokens,
  )
}

watch(
  () => studio.nanobanana2TopP,
  (value) => {
    const next = clampStudioTopP(value, NANOBANANA2_DEFAULTS.topP)
    if (next !== value) {
      studio.nanobanana2TopP = next
    }
  },
)

const formatItems = [
  { label: 'Images & text', value: 'text_and_image', icon: 'i-lucide-images' },
  { label: 'Images only', value: 'image_only', icon: 'i-lucide-image' },
]

const resolutionItems = NANOBANANA2_IMAGE_SIZES.map((v) => ({
  label: v,
  value: v,
  icon: 'i-lucide-maximize-2',
}))

const thinkingItems: { label: string, value: Nanobanana2ThinkingUi, icon: string }[] = [
  { label: 'Default', value: 'default', icon: 'i-lucide-sparkles' },
  { label: 'Minimal', value: 'minimal', icon: 'i-lucide-minus' },
  { label: 'Low', value: 'low', icon: 'i-lucide-flame' },
  { label: 'Medium', value: 'medium', icon: 'i-lucide-zap' },
  { label: 'High', value: 'high', icon: 'i-lucide-brain' },
]
</script>
