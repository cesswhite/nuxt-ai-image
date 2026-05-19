<template>
  <div class="flex h-full w-full min-h-0">
    <div v-if="studio.error && !studio.lastOutput"
      class="flex flex-1 items-center justify-center p-6 text-sm text-error">
      {{ studio.error }}
    </div>
    <div v-else-if="!studio.lastOutput"
      class="flex h-full flex-1 items-center justify-center p-8 text-center text-xs text-dark-950/40 dark:text-dark-50/40">
      Generated image appears here.
    </div>
    <div v-else ref="viewportRef"
      class="relative flex min-h-0 flex-1 items-center justify-center touch-none select-none overflow-hidden">
      <img ref="targetRef" :key="studio.lastOutput" :src="studio.lastOutput" alt="Generated result"
        class="max-h-full max-w-full object-contain will-change-transform" width="1024" height="1024" decoding="async"
        draggable="false" @load="onImageLoad">

      <Transition enter-active-class="transition-opacity duration-200 ease-out"
        leave-active-class="transition-opacity duration-150 ease-in" enter-from-class="opacity-0"
        leave-to-class="opacity-0">
        <div v-if="isZoomed" class="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <UButton type="button" label="Reset view" color="neutral" variant="subtle" size="xs"
            icon="i-lucide-minimize-2" class="pointer-events-auto cursor-pointer shadow-sm backdrop-blur-sm"
            @click="resetView()" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const studio = useStudioStore()

const viewportRef = ref<HTMLElement | null>(null)
const targetRef = ref<HTMLElement | null>(null)
const imageSrc = computed(() => studio.lastOutput?.trim() ?? '')

const { isZoomed, resetView } = useStudioPreviewPanzoom(viewportRef, targetRef, imageSrc)

function onImageLoad() {
  nextTick(() => resetView(false))
}
</script>
