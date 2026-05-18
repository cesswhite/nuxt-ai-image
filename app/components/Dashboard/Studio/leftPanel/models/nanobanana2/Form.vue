<template>
  <div class="space-y-3">
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Output format</span>
        <UTooltip
          text="What the model returns: images only, or images plus short text. Pick based on whether you care about captions or explanations alongside the picture."
          class="cursor-help inline-block"
          :content="{ side: 'top' }"
          :delay-duration="0"
        >
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioFieldDropdown
        v-model="studio.nanobanana2OutputFormat"
        :items="formatItems"
        :disabled="studio.loading"
        icon="i-lucide-gallery-horizontal"
        placeholder="Output format…"
      />
    </UFormField>
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Temperature</span>
        <UTooltip
          text="How random the model behaves (0–1). Lower = steadier, more predictable images; higher = more variation and surprise. The slider moves in steps of 0.05."
          class="cursor-help inline-block"
          :content="{ side: 'top' }"
          :delay-duration="0"
        >
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioTemperatureSlider
        v-model="studio.nanobanana2Temperature"
        :disabled="studio.loading"
      />
    </UFormField>
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Resolution</span>
        <UTooltip
          text="Output image size (e.g. 512, 1K, 2K, 4K). Higher usually means more detail and larger files; the API must support the value you pick."
          class="cursor-help inline-block"
          :content="{ side: 'top' }"
          :delay-duration="0"
        >
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioFieldDropdown
        v-model="studio.nanobanana2ImageSize"
        :items="resolutionItems"
        :disabled="studio.loading"
        icon="i-lucide-maximize-2"
        placeholder="Resolution…"
      />
    </UFormField>
    <div class="flex flex-col gap-3 border-t border-default/60 pt-2">
      <USwitch
        v-model="studio.nanobanana2GroundingWeb"
        label="Grounding with Google Search"
        description="Source: Google Search"
      />
      <USwitch v-model="studio.nanobanana2GroundingImageSearch" label="Image search" />
    </div>
    <DashboardStudioLeftPanelAdvancedDisclosure>
      <UFormField :ui="labelRowUi">
        <template #label>
          <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Add stop sequence</span>
          <UTooltip
            text="Truncate response including and after this string. Separate multiple entries with a comma, newline, or |."
            class="cursor-help inline-block"
            :content="{ side: 'top' }"
            :delay-duration="0"
          >
            <UIcon name="i-lucide-info" class="size-3 shrink-0" />
          </UTooltip>
        </template>
        <UInput
          v-model="studio.nanobanana2StopSequencesRaw"
          variant="outline"
          placeholder="Add stop…"
          class="w-full"
          :disabled="studio.loading"
        />
      </UFormField>
      <UFormField :ui="labelRowUi">
        <template #label>
          <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Output length</span>
          <UTooltip
            text="Maximum number of tokens in the response (e.g. 65536)."
            class="cursor-help inline-block"
            :content="{ side: 'top' }"
            :delay-duration="0"
          >
            <UIcon name="i-lucide-info" class="size-3 shrink-0" />
          </UTooltip>
        </template>
        <UInput
          v-model.number="studio.nanobanana2MaxOutputTokens"
          type="number"
          variant="outline"
          :min="1"
          :max="65536"
          step="1"
          class="w-full tabular-nums"
          :disabled="studio.loading"
          @blur="clampMaxOutputTokens"
        />
      </UFormField>
      <UFormField :ui="labelRowUi">
        <template #label>
          <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Top P</span>
          <UTooltip
            text="Probability threshold for top-p sampling (0–1). The slider moves in steps of 0.05."
            class="cursor-help inline-block"
            :content="{ side: 'top' }"
            :delay-duration="0"
          >
            <UIcon name="i-lucide-info" class="size-3 shrink-0" />
          </UTooltip>
        </template>
        <DashboardStudioTemperatureSlider
          v-model="studio.nanobanana2TopP"
          :min="0"
          :max="1"
          :step="NANOBANANA2_TOP_P_STEP"
          :disabled="studio.loading"
        />
      </UFormField>
      <UFormField :ui="labelRowUi">
        <template #label>
          <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Thinking level</span>
          <UTooltip
            text="How much internal reasoning Gemini uses before the image step, when the API supports it. Higher can help hard prompts; “Default” lets the backend decide."
            class="cursor-help inline-block"
            :content="{ side: 'top' }"
            :delay-duration="0"
          >
            <UIcon name="i-lucide-info" class="size-3 shrink-0" />
          </UTooltip>
        </template>
        <DashboardStudioFieldDropdown
          v-model="studio.nanobanana2ThinkingLevel"
          :items="thinkingItems"
          :disabled="studio.loading"
          icon="i-lucide-brain"
          placeholder="Thinking level…"
        />
      </UFormField>
    </DashboardStudioLeftPanelAdvancedDisclosure>
  </div>
</template>

<script setup lang="ts">
import type { Nanobanana2ThinkingUi } from '~/stores/studio'
import {
  clampNanobanana2MaxOutputTokens,
  clampNanobanana2TopP,
  NANOBANANA2_IMAGE_SIZES,
  NANOBANANA2_TOP_P_STEP,
} from '~/utils/gemini31Nanobanana2'

const labelRowUi = { label: 'flex items-center justify-between w-full' } as const

const studio = useStudioStore()

function clampMaxOutputTokens() {
  studio.nanobanana2MaxOutputTokens = clampNanobanana2MaxOutputTokens(
    studio.nanobanana2MaxOutputTokens,
  )
}

watch(
  () => studio.nanobanana2TopP,
  (value) => {
    const next = clampNanobanana2TopP(value)
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
