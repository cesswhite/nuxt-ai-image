<template>
  <div class="flex flex-col gap-y-4">
    <UFormField>
      <DashboardStudioFieldDropdown v-model="studio.provider" :items="providerItems" icon="i-lucide-globe"
        tooltip="Gemini (Google) or GPT Image (OpenAI). Both turn your text into an image—different company, different models and rules." />
    </UFormField>
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Model</span>
        <UTooltip
          text="The exact image model that runs your prompt. Your choice affects quality, speed, and price; the fields below match this model."
          class="cursor-help inline-block" :content="{ side: 'top' }" :delay-duration="0">
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioFieldDropdown v-model="studio.model" :items="modelItems" icon="i-lucide-image"
        tooltip="The exact image model that runs your prompt. Your choice affects quality, speed, and price; the fields below match this model." />
    </UFormField>
    <UFormField v-if="studio.provider === 'google-gemini'" :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Aspect ratio</span>
        <UTooltip
          text="How wide vs tall the picture is (landscape, portrait, or square). Each model only allows some shapes—this menu shows what you can use."
          class="cursor-help inline-block" :content="{ side: 'top' }" :delay-duration="0">
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioFieldDropdown v-model="studio.aspectRatio" :items="geminiAspectItems" placeholder="Aspect ratio…"
        icon="i-lucide-ratio" />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import {
  studioModelSelectItems,
  studioProviderSelectItems,
} from '~/utils/studioImageModels'
import { geminiAspectSelectItemsForModel } from '~/utils/geminiAspectRatios'


const labelRowUi = { label: 'flex items-center justify-between w-full' } as const

const studio = useStudioStore()

const geminiAspectItems = computed(() =>
  geminiAspectSelectItemsForModel(studio.model).map((row) => ({
    ...row,
    icon: 'i-lucide-ratio',
  })),
)

const providerItems = studioProviderSelectItems('sidebar')

const modelItems = computed(() => studioModelSelectItems(studio.provider))
</script>
