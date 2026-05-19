<template>
  <div class="fixed top-2 right-2 z-40">
    <ClientOnly>
      <UTooltip :text="tooltipText">
        <UColorModeButton color="neutral" variant="outline" square size="md" class="cursor-pointer" />
      </UTooltip>
      <template #fallback>
        <USkeleton class="size-9 shrink-0 rounded-md" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const tooltipText = computed(() =>
  colorMode.value === 'dark' ? 'Switch to light' : 'Switch to dark',
)
</script>
