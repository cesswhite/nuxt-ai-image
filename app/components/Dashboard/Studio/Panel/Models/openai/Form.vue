<template>
  <div v-if="studio.provider === 'openai'" class="space-y-3 flex items-center justify-center">
    <UFormField v-if="isOpenAi15" label="Aspect ratio">
      <DashboardStudioFieldDropdown v-model="studio.aspectRatio" :items="gptImage15AspectItems" icon="i-lucide-ratio"
        placeholder="Aspect ratio…" />
    </UFormField>
    <UFormField v-if="isOpenAi2" label="Size">
      <DashboardStudioFieldDropdown v-model="studio.openAiGptImage2Size" :items="gptImage2SizeItems"
        icon="i-lucide-scan" placeholder="Size…" />
    </UFormField>
    <UFormField label="Quality">
      <DashboardStudioFieldDropdown v-model="studio.openAiQuality" :items="openAiQualityItems"
        icon="i-lucide-badge-check" placeholder="Quality…" />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import {
  GPT_IMAGE_15_ASPECT_ITEMS,
  GPT_IMAGE_2_SIZE_ITEMS,
  OPENAI_QUALITY_ITEMS,
} from '~/utils/openAiImagePresets'

defineProps<{
  isOpenAi15: boolean
  isOpenAi2: boolean
}>()

const studio = useStudioStore()

const gptImage15AspectItems = computed(() =>
  GPT_IMAGE_15_ASPECT_ITEMS.map((row) => ({ ...row, icon: 'i-lucide-ratio' })),
)
const gptImage2SizeItems = computed(() =>
  GPT_IMAGE_2_SIZE_ITEMS.map((row) => ({ ...row, icon: 'i-lucide-maximize-2' })),
)
const openAiQualityItems = computed(() =>
  OPENAI_QUALITY_ITEMS.map((row) => ({ ...row, icon: 'i-lucide-badge-check' })),
)
</script>
