<template>
  <div class="flex h-full w-full">
    <div v-if="studio.error && !studio.lastOutput"
      class="flex flex-1 items-center justify-center p-6 text-sm text-error">
      {{ studio.error }}
    </div>
    <div v-else-if="!studio.lastOutput"
      class="flex flex-1 items-center justify-center p-8 text-center text-dimmed h-890">
      Generated image appears here.
    </div>
    <div v-else class="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
      <img :src="studio.lastOutput" alt="Generated result" class="max-h-full max-w-full object-contain" width="1024"
        height="1024" loading="lazy" decoding="async" fetchpriority="low">
    </div>
  </div>
</template>

<script setup lang="ts">
const studio = useStudioStore()
</script>
