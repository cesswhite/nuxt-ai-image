<template>
  <div class="space-y-3">
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Temperature</span>
        <UTooltip
          text="How random the model behaves (0–1). Lower = steadier outputs; higher = more variation."
          class="cursor-help inline-block"
          :content="{ side: 'top' }"
          :delay-duration="0"
        >
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioTemperatureSlider
        v-model="studio.nanobananaProTemperature"
        :disabled="studio.loading"
      />
    </UFormField>
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Aspect ratio</span>
        <UTooltip
          text="Shape of the image. Auto lets the model choose; fixed ratios match common formats."
          class="cursor-help inline-block"
          :content="{ side: 'top' }"
          :delay-duration="0"
        >
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioFieldDropdown
        v-model="studio.aspectRatio"
        :items="aspectItems"
        :disabled="studio.loading"
        icon="i-lucide-ratio"
        placeholder="Aspect ratio…"
      />
    </UFormField>
    <UFormField :ui="labelRowUi">
      <template #label>
        <span class="text-xs font-medium text-highlighted/70 inline-block w-full">Resolution</span>
        <UTooltip
          text="Output image size (1K, 2K, or 4K). Higher usually means more detail and larger files."
          class="cursor-help inline-block"
          :content="{ side: 'top' }"
          :delay-duration="0"
        >
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        </UTooltip>
      </template>
      <DashboardStudioFieldDropdown
        v-model="studio.nanobananaProImageSize"
        :items="resolutionItems"
        :disabled="studio.loading"
        icon="i-lucide-maximize-2"
        placeholder="Resolution…"
      />
    </UFormField>
    <div class="flex flex-col gap-3 border-t border-default/60 pt-2">
      <USwitch
        v-model="studio.nanobananaProGroundingWeb"
        label="Grounding with Google Search"
        description="Source: Google Search"
        :disabled="studio.loading"
      />
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
          v-model="studio.nanobananaProStopSequencesRaw"
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
            text="Maximum number of tokens in the response (e.g. 32768)."
            class="cursor-help inline-block"
            :content="{ side: 'top' }"
            :delay-duration="0"
          >
            <UIcon name="i-lucide-info" class="size-3 shrink-0" />
          </UTooltip>
        </template>
        <UInput
          v-model.number="studio.nanobananaProMaxOutputTokens"
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
          v-model="studio.nanobananaProTopP"
          :min="0"
          :max="1"
          :step="STUDIO_TOP_P_STEP"
          :disabled="studio.loading"
        />
      </UFormField>
      <UFormField label="System instructions" hint="Optional tone and style for the model">
        <UTextarea
          v-model="studio.nanobananaProSystemInstruction"
          variant="outline"
          :rows="3"
          autoresize
          :maxlength="4000"
          placeholder="Optional tone and style instructions…"
          class="w-full text-sm"
          :disabled="studio.loading"
        />
      </UFormField>
    </DashboardStudioLeftPanelAdvancedDisclosure>
  </div>
</template>

<script setup lang="ts">
import {
  clampStudioMaxOutputTokens,
  clampStudioTopP,
  geminiAspectSelectItemsForModel,
  STUDIO_TOP_P_STEP,
} from '~/utils/geminiImageUtils'
import {
  NANOBANANA_PRO_DEFAULTS,
  NANOBANANA_PRO_IMAGE_SIZES,
} from '~/utils/geminiProNanobanana'
import { STUDIO_IMAGE_MODEL } from '~/utils/studioImageModels'

const labelRowUi = { label: 'flex items-center justify-between w-full' } as const

const studio = useStudioStore()

const aspectItems = computed(() =>
  geminiAspectSelectItemsForModel(STUDIO_IMAGE_MODEL.NANOBANANA_PRO).map((row) => ({
    ...row,
    icon: 'i-lucide-ratio',
  })),
)

const resolutionItems = NANOBANANA_PRO_IMAGE_SIZES.map((v) => ({
  label: v,
  value: v,
  icon: 'i-lucide-maximize-2',
}))

function clampMaxOutputTokens() {
  studio.nanobananaProMaxOutputTokens = clampStudioMaxOutputTokens(
    studio.nanobananaProMaxOutputTokens,
    NANOBANANA_PRO_DEFAULTS.maxOutputTokens,
  )
}

watch(
  () => studio.nanobananaProTopP,
  (value) => {
    const next = clampStudioTopP(value, NANOBANANA_PRO_DEFAULTS.topP)
    if (next !== value) {
      studio.nanobananaProTopP = next
    }
  },
)
</script>
