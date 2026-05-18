<template>
  <UFormField label="Prompt" required class="w-full">
    <div
      class="flex min-h-32 flex-col rounded-lg border border-default bg-elevated/40 p-2 ring ring-default/40 backdrop-blur-sm"
    >
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
</template>

<script setup lang="ts">
const studio = useStudioStore()
const { handleEnhancePrompt, handleSurprisePrompt } = useStudioPromptAssist()
</script>
