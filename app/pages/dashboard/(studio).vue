<template>
  <div
    v-motion
    class="mx-auto max-w-5xl space-y-8"
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0 }"
    :duration="280"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-highlighted md:text-xl">
        Generate
      </h2>
      <p class="text-sm text-dimmed">
        Minimal form pattern: provider, model, aspect ratio, and prompt. Server route is demo-safe until you wire OpenAI or Gemini SDKs.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <UCard
        v-motion
        class="ring-default"
        :initial="{ opacity: 0, y: 10 }"
        :visible="{ opacity: 1, y: 0 }"
        :duration="240"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sliders-horizontal" class="size-5 text-primary" />
            <span class="font-medium text-highlighted">Inputs</span>
          </div>
        </template>

        <UForm :state="studio" class="space-y-4" @submit.prevent="generate">
          <UFormField label="Provider">
            <USelect
              v-model="studio.provider"
              value-key="value"
              :items="providerItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Model (template label — map to real IDs in your fork)">
            <UInput
              v-model="studio.model"
              placeholder="e.g. gemini-2.5-flash-image or gpt-image-1"
              autocomplete="off"
            />
          </UFormField>

          <UFormField label="Aspect ratio">
            <USelect
              v-model="studio.aspectRatio"
              value-key="value"
              :items="aspectItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Prompt" required>
            <UTextarea
              v-model="studio.prompt"
              :rows="6"
              autoresize
              placeholder="Describe the image you want..."
              class="w-full"
            />
          </UFormField>

          <div class="flex flex-wrap items-center gap-3">
            <UButton
              type="submit"
              color="primary"
              :loading="studio.loading"
              icon="i-lucide-sparkles"
              class="cursor-pointer"
            >
              Generate
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              class="cursor-pointer"
              :disabled="!studio.lastOutput"
              @click="clearOutput"
            >
              Clear result
            </UButton>
          </div>
        </UForm>
      </UCard>

      <UCard
        v-motion
        class="ring-default"
        :initial="{ opacity: 0, y: 10 }"
        :visible="{ opacity: 1, y: 0 }"
        :duration="260"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-image" class="size-5 text-primary" />
            <span class="font-medium text-highlighted">Result</span>
          </div>
        </template>

        <div class="space-y-4">
          <UAlert
            v-if="demoFlag"
            color="info"
            variant="subtle"
            title="Demo mode"
            description="NUXT_PUBLIC_IMAGE_GEN_DEMO=true — returns a local SVG. Disable for real API wiring."
          />

          <div
            v-if="studio.error && !studio.lastOutput"
            class="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error"
          >
            {{ studio.error }}
          </div>

          <div
            v-else-if="!studio.lastOutput"
            class="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-muted p-8 text-center text-dimmed"
          >
            Output appears here after generate.
          </div>

          <template v-else>
            <div class="overflow-hidden rounded-lg border border-default bg-elevated/40">
              <img
                :src="studio.lastOutput"
                alt="Generated result"
                class="mx-auto max-h-[min(70vh,520px)] w-full object-contain"
                width="768"
                height="768"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              >
            </div>
            <p class="text-xs text-dimmed">
              Use Nuxt Image or your CDN pipeline for production URLs; data URLs suit demos only.
            </p>
          </template>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudioProvider } from '~/stores/studio'

definePageMeta({
  layout: 'dashboard',
})

const studio = useStudioStore()
const { generate } = useGenerateImage()

const config = useRuntimeConfig()
const demoFlag = computed(() => config.public.imageGenDemo === true)

const providerItems: { label: string, value: StudioProvider }[] = [
  { label: 'Google — Gemini / Imagen', value: 'google-gemini' },
  { label: 'OpenAI — GPT Image', value: 'openai' },
]

const aspectItems = [
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
]

function clearOutput() {
  studio.setOutput('')
  studio.setError(null)
}

useSeoMeta({
  title: 'Studio | Nuxt AI Images',
  description: 'Minimal AI image generation dashboard — template for Nuxt UI.',
})
</script>
