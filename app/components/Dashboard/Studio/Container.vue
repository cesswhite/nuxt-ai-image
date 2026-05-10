<template>
  <!-- Class-for-class shell from `nananuxt/.../Relight/Container.vue` (grid 12 / 2-8-2, scroll rails, sticky actions). -->
  <div class="flex h-screen w-full flex-col overflow-hidden">
    <div class="grid min-h-screen w-full grid-cols-12 gap-1 p-1">
      <!-- Left col-span-2 -->
      <div
        class="col-span-2 flex h-full w-full flex-col overflow-y-auto overflow-x-visible scrollbar-hide p-1"
      >
        <div class="flex h-full w-full flex-col items-center justify-between gap-2">
          <div class="flex w-full flex-1 flex-col gap-2">
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :visible-once="{ opacity: 1, y: 0 }"
              :duration="280"
              :delay="0"
            >
              <UCard variant="subtle">
                <template #header>
                  <div class="flex items-center gap-2 px-1">
                    <UIcon name="i-lucide-sliders-horizontal" class="size-5 text-primary" />
                    <span class="font-medium text-highlighted">Inputs</span>
                  </div>
                </template>
                <div class="space-y-3">
                  <UFormField label="Provider">
                    <USelect
                      v-model="studio.provider"
                      value-key="value"
                      variant="outline"
                      :items="providerItems"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Model">
                    <USelect
                      v-model="studio.model"
                      value-key="value"
                      variant="outline"
                      :items="modelItems"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField v-if="studio.provider === 'google-gemini'" label="Aspect ratio">
                    <USelect
                      v-model="studio.aspectRatio"
                      value-key="value"
                      variant="outline"
                      :items="geminiAspectItems"
                      class="w-full"
                    />
                  </UFormField>
                  <template v-if="isNanobanana2">
                    <UFormField label="Output format">
                      <USelect
                        v-model="studio.nanobanana2OutputFormat"
                        value-key="value"
                        variant="outline"
                        :items="nanobanana2FormatItems"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Temperature">
                      <UInput
                        v-model.number="studio.nanobanana2Temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.05"
                        variant="outline"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Resolution">
                      <USelect
                        v-model="studio.nanobanana2ImageSize"
                        value-key="value"
                        variant="outline"
                        :items="nanobanana2ResolutionItems"
                        class="w-full"
                      />
                    </UFormField>
                    <div class="flex flex-col gap-3 border-t border-default/60 pt-2">
                      <USwitch
                        v-model="studio.nanobanana2GroundingWeb"
                        label="Grounding with Google Search"
                        description="Source: Google Search"
                      />
                      <USwitch
                        v-model="studio.nanobanana2GroundingImageSearch"
                        label="Image search"
                      />
                    </div>
                    <details class="rounded-lg border border-default bg-elevated/30 px-2 py-1.5 text-sm">
                      <summary class="cursor-pointer font-medium text-highlighted">Advanced</summary>
                      <div class="mt-2 space-y-2">
                        <UFormField
                          label="Stop sequences"
                          hint="Separate with comma, newline, or |"
                        >
                          <UInput
                            v-model="studio.nanobanana2StopSequencesRaw"
                            variant="outline"
                            placeholder="Add stop…"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField
                          label="Output length"
                          hint="Max output tokens (e.g. 65536)"
                        >
                          <UInput
                            v-model.number="studio.nanobanana2MaxOutputTokens"
                            type="number"
                            min="1"
                            max="65536"
                            step="1"
                            variant="outline"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField label="Top P">
                          <UInput
                            v-model.number="studio.nanobanana2TopP"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            variant="outline"
                            class="w-full"
                          />
                        </UFormField>
                      </div>
                    </details>
                  </template>
                  <template v-if="isNanobananaPro">
                    <UFormField
                      label="System instructions"
                      hint="Optional tone and style for the model"
                    >
                      <UTextarea
                        v-model="studio.nanobananaProSystemInstruction"
                        variant="outline"
                        :rows="3"
                        autoresize
                        :maxlength="4000"
                        placeholder="Optional tone and style instructions…"
                        class="w-full text-sm"
                      />
                    </UFormField>
                    <UFormField label="Temperature">
                      <UInput
                        v-model.number="studio.nanobananaProTemperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.05"
                        variant="outline"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Resolution">
                      <USelect
                        v-model="studio.nanobananaProImageSize"
                        value-key="value"
                        variant="outline"
                        :items="nanobananaProResolutionItems"
                        class="w-full"
                      />
                    </UFormField>
                    <div class="flex flex-col gap-3 border-t border-default/60 pt-2">
                      <USwitch
                        v-model="studio.nanobananaProGroundingWeb"
                        label="Grounding with Google Search"
                        description="Source: Google Search"
                      />
                    </div>
                    <details class="rounded-lg border border-default bg-elevated/30 px-2 py-1.5 text-sm">
                      <summary class="cursor-pointer font-medium text-highlighted">Advanced</summary>
                      <div class="mt-2 space-y-2">
                        <UFormField
                          label="Stop sequences"
                          hint="Separate with comma, newline, or |"
                        >
                          <UInput
                            v-model="studio.nanobananaProStopSequencesRaw"
                            variant="outline"
                            placeholder="Add stop…"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField
                          label="Output length"
                          hint="Max output tokens (e.g. 32768)"
                        >
                          <UInput
                            v-model.number="studio.nanobananaProMaxOutputTokens"
                            type="number"
                            min="1"
                            max="65536"
                            step="1"
                            variant="outline"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField label="Top P">
                          <UInput
                            v-model.number="studio.nanobananaProTopP"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            variant="outline"
                            class="w-full"
                          />
                        </UFormField>
                      </div>
                    </details>
                  </template>
                  <template v-if="isNanobanana25">
                    <UFormField
                      label="System instructions"
                      hint="Optional tone and style for the model"
                    >
                      <UTextarea
                        v-model="studio.nanobanana25SystemInstruction"
                        variant="outline"
                        :rows="3"
                        autoresize
                        :maxlength="4000"
                        placeholder="Optional tone and style instructions…"
                        class="w-full text-sm"
                      />
                    </UFormField>
                    <UFormField label="Temperature">
                      <UInput
                        v-model.number="studio.nanobanana25Temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.05"
                        variant="outline"
                        class="w-full"
                      />
                    </UFormField>
                    <details class="rounded-lg border border-default bg-elevated/30 px-2 py-1.5 text-sm">
                      <summary class="cursor-pointer font-medium text-highlighted">Advanced</summary>
                      <div class="mt-2 space-y-2">
                        <UFormField
                          label="Stop sequences"
                          hint="Separate with comma, newline, or |"
                        >
                          <UInput
                            v-model="studio.nanobanana25StopSequencesRaw"
                            variant="outline"
                            placeholder="Add stop…"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField
                          label="Output length"
                          hint="Max output tokens (e.g. 32768)"
                        >
                          <UInput
                            v-model.number="studio.nanobanana25MaxOutputTokens"
                            type="number"
                            min="1"
                            max="65536"
                            step="1"
                            variant="outline"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField label="Top P">
                          <UInput
                            v-model.number="studio.nanobanana25TopP"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            variant="outline"
                            class="w-full"
                          />
                        </UFormField>
                      </div>
                    </details>
                  </template>
                  <UFormField v-else-if="isOpenAi15" label="Aspect ratio">
                    <USelect
                      v-model="studio.aspectRatio"
                      value-key="value"
                      variant="outline"
                      :items="gptImage15AspectItems"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField v-else-if="isOpenAi2" label="Size">
                    <USelect
                      v-model="studio.openAiGptImage2Size"
                      value-key="value"
                      variant="outline"
                      :items="gptImage2SizeItems"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField v-if="studio.provider === 'openai'" label="Quality">
                    <USelect
                      v-model="studio.openAiQuality"
                      value-key="value"
                      variant="outline"
                      :items="openAiQualityItems"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Prompt" required class="w-full">
                    <div class="flex min-h-32 flex-col rounded-lg border border-default bg-elevated/40 p-2 ring ring-default/40 backdrop-blur-sm">
                      <UTextarea
                        v-model="studio.prompt"
                        variant="outline"
                        :rows="5"
                        autoresize
                        :maxlength="4000"
                        placeholder="Describe the image: subject, setting, lighting, style…"
                        class="w-full flex-1 bg-transparent"
                        :disabled="studio.loading || studio.loadingGpt || studio.loadingSurprise"
                        :ui="{ base: 'resize-y border-0 bg-transparent ring-0 focus:ring-0 rounded-md p-0 text-sm placeholder:text-dimmed' }"
                      />
                      <div class="mt-2 flex w-full items-end justify-between gap-2">
                        <span class="select-none text-xs text-dimmed tabular-nums">
                          {{ studio.prompt.length }}/4000
                        </span>
                        <div class="flex items-center gap-2">
                          <UTooltip text="Enhance text">
                            <UButton
                              type="button"
                              variant="ghost"
                              color="neutral"
                              icon="i-lucide-sparkles"
                              class="cursor-pointer"
                              :disabled="studio.loading || studio.loadingGpt || studio.loadingSurprise || !studio.prompt.trim()"
                              :loading="studio.loadingGpt"
                              aria-label="Enhance prompt"
                              @click="handleEnhancePrompt"
                            />
                          </UTooltip>
                          <UTooltip text="Surprise Me">
                            <UButton
                              type="button"
                              variant="ghost"
                              color="neutral"
                              icon="i-lucide-wand-2"
                              class="cursor-pointer"
                              :disabled="studio.loading || studio.loadingGpt || studio.loadingSurprise"
                              :loading="studio.loadingSurprise"
                              aria-label="Surprise me with a random prompt"
                              @click="handleSurprisePrompt"
                            />
                          </UTooltip>
                        </div>
                      </div>
                    </div>
                  </UFormField>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>

      <!-- Center col-span-8 -->
      <div
        class="col-span-8 overflow-hidden p-1"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :duration="320"
      >
        <div class="flex h-full min-h-[min(60dvh,480px)] flex-col overflow-hidden rounded-lg bg-elevated/30 ring ring-default/60">
          <div
            v-if="studio.error && !studio.lastOutput"
            class="flex flex-1 items-center justify-center p-6 text-sm text-error"
          >
            {{ studio.error }}
          </div>
          <div
            v-else-if="!studio.lastOutput"
            class="flex flex-1 items-center justify-center p-8 text-center text-dimmed"
          >
            Generated image appears here.
          </div>
          <div v-else class="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
            <img
              :src="studio.lastOutput"
              alt="Generated result"
              class="max-h-full max-w-full object-contain"
              width="1024"
              height="1024"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            >
          </div>
        </div>
      </div>

      <!-- Right col-span-2 -->
      <div
        class="col-span-2 flex w-full flex-col overflow-y-auto overflow-x-visible scrollbar-hide p-1"
      >
        <div
          class="sticky bottom-0 left-0 right-0 mt-auto shrink-0 bg-linear-to-t from-default to-transparent pt-6 backdrop-blur-xl mask-t-from-75%"
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :visible-once="{ opacity: 1, y: 0 }"
          :duration="300"
          :delay="100"
        >
          <div class="flex w-full flex-col gap-2 px-4">
            <div class="flex gap-2">
              <UButton
                variant="beautify"
                color="primary"
                class="flex-1 cursor-pointer"
                block
                size="lg"
                :loading="studio.loading"
                @click="generate"
              >
                Generate
              </UButton>
            </div>
            <UButton
              variant="outline"
              color="neutral"
              size="lg"
              class="cursor-pointer"
              block
              :disabled="!studio.lastOutput"
              @click="clearOutput"
            >
              Clear result
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudioProvider } from '~/stores/studio'
import {
  GEMINI_IMAGE_MODEL_IDS,
  OPENAI_IMAGE_MODEL_IDS,
  defaultModelForProvider,
  isAllowedStudioModel,
  studioModelSelectItems,
} from '~/utils/studioImageModels'
import { TEXT_API_ENHANCE_PROMPT, TEXT_API_SURPRISE_PROMPT } from '~/utils/textApiRoutes'
import {
  GPT_IMAGE_15_ASPECT_ITEMS,
  GPT_IMAGE_2_SIZE_ITEMS,
  OPENAI_QUALITY_ITEMS,
} from '~/utils/openAiImagePresets'
import {
  geminiAspectSelectItemsForModel,
  isAllowedGeminiAspectForModel,
} from '~/utils/geminiAspectRatios'
import { NANOBANANA2_IMAGE_SIZES } from '~/utils/gemini31Nanobanana2'
import { NANOBANANA_PRO_IMAGE_SIZES } from '~/utils/geminiProNanobanana'

const GEMINI_31_MODEL = 'gemini-3.1-flash-image-preview'
const GEMINI_3_PRO_MODEL = 'gemini-3-pro-image-preview'
const GEMINI_25_MODEL = 'gemini-2.5-flash-image'

const studio = useStudioStore()
const { generate } = useGenerateImage()
const toast = useToast()

type AssistOk = { success: true, data: { text: string } }
type AssistErr = { success: false, error?: string }
type AssistRes = AssistOk | AssistErr

async function handleEnhancePrompt() {
  if (!studio.prompt.trim()) return
  studio.setLoadingGpt(true)
  studio.setError(null)
  try {
    const res = await $fetch<AssistRes>(TEXT_API_ENHANCE_PROMPT, {
      method: 'POST',
      body: { prompt: studio.prompt },
    })
    if (res.success && res.data?.text) {
      studio.setPrompt(res.data.text.trim())
      toast.add({ title: 'Prompt enhanced', color: 'success' })
    }
    else {
      const msg = !res.success && 'error' in res ? (res.error ?? 'Try again') : 'Try again'
      toast.add({ title: 'Enhance failed', description: msg, color: 'error' })
      studio.setError(msg)
    }
  }
  catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'data' in e
      ? String((e as { data?: { message?: string } }).data?.message ?? 'Request failed')
      : e instanceof Error ? e.message : 'Request failed'
    toast.add({ title: 'Enhance failed', description: msg, color: 'error' })
    studio.setError(msg)
  }
  finally {
    studio.setLoadingGpt(false)
  }
}

async function handleSurprisePrompt() {
  studio.setLoadingSurprise(true)
  studio.setError(null)
  try {
    const res = await $fetch<AssistRes>(TEXT_API_SURPRISE_PROMPT, {
      method: 'POST',
    })
    if (res.success && res.data?.text) {
      studio.setPrompt(res.data.text.trim())
      toast.add({ title: 'Prompt ready', description: 'A new idea was generated.', color: 'success' })
    }
    else {
      const msg = !res.success && 'error' in res ? (res.error ?? 'Try again') : 'Try again'
      toast.add({ title: 'Surprise failed', description: msg, color: 'error' })
      studio.setError(msg)
    }
  }
  catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'data' in e
      ? String((e as { data?: { message?: string } }).data?.message ?? 'Request failed')
      : e instanceof Error ? e.message : 'Request failed'
    toast.add({ title: 'Surprise failed', description: msg, color: 'error' })
    studio.setError(msg)
  }
  finally {
    studio.setLoadingSurprise(false)
  }
}

const geminiAspectItems = computed(() =>
  geminiAspectSelectItemsForModel(studio.model),
)

const isNanobanana2 = computed(
  () => studio.provider === 'google-gemini' && studio.model === GEMINI_31_MODEL,
)

const isNanobananaPro = computed(
  () => studio.provider === 'google-gemini' && studio.model === GEMINI_3_PRO_MODEL,
)

const isNanobanana25 = computed(
  () => studio.provider === 'google-gemini' && studio.model === GEMINI_25_MODEL,
)

const nanobanana2FormatItems = [
  { label: 'Images & text', value: 'text_and_image' },
  { label: 'Images only', value: 'image_only' },
]

const nanobanana2ResolutionItems = NANOBANANA2_IMAGE_SIZES.map((v) => ({
  label: v,
  value: v,
}))

const nanobananaProResolutionItems = NANOBANANA_PRO_IMAGE_SIZES.map((v) => ({
  label: v,
  value: v,
}))

const gptImage15AspectItems = GPT_IMAGE_15_ASPECT_ITEMS
const gptImage2SizeItems = GPT_IMAGE_2_SIZE_ITEMS
const openAiQualityItems = OPENAI_QUALITY_ITEMS

const isOpenAi15 = computed(
  () => studio.provider === 'openai' && studio.model === 'gpt-image-1.5',
)
const isOpenAi2 = computed(
  () => studio.provider === 'openai' && studio.model === 'gpt-image-2',
)

const providerItems: { label: string, value: StudioProvider }[] = [
  { label: 'Google — Gemini / Imagen', value: 'google-gemini' },
  { label: 'OpenAI — GPT Image', value: 'openai' },
]

const modelItems = computed(() =>
  studioModelSelectItems(
    studio.provider === 'openai'
      ? [...OPENAI_IMAGE_MODEL_IDS]
      : [...GEMINI_IMAGE_MODEL_IDS],
  ),
)

watch(
  () => studio.provider,
  (p) => {
    if (!isAllowedStudioModel(p, studio.model)) {
      studio.model = defaultModelForProvider(p)
    }
  },
)

watch(
  () => [studio.provider, studio.model] as const,
  () => {
    if (studio.provider !== 'google-gemini') return
    if (!isAllowedGeminiAspectForModel(studio.model, studio.aspectRatio)) {
      studio.aspectRatio = '1:1'
    }
  },
)

function clearOutput() {
  studio.setOutput('')
  studio.setError(null)
}
</script>
