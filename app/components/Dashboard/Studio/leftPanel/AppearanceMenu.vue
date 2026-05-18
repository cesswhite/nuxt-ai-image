<template>
  <ClientOnly>
    <UDropdownMenu :items="items" :ui="{ content: 'w-48' }">
      <UTooltip text="Appearance">
        <UButton
          :block="!compact"
          variant="ghost"
          :label="compact ? undefined : 'Appearance'"
          color="neutral"
          :size="compact ? 'xs' : 'sm'"
          icon="i-lucide-palette"
          :square="compact"
          :class="compact ? 'cursor-pointer shrink-0' : 'cursor-pointer w-full'"
          aria-label="Appearance"
        />
      </UTooltip>
      <template #theme>
        <UColorModeSwitch />
      </template>
      <template #primary-color>
        <AppSwitchPrimaryColor />
      </template>
    </UDropdownMenu>
    <template #fallback>
      <USkeleton class="size-8 shrink-0 rounded-md" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Icon-only control for compact toolbars (e.g. bottom composer). */
    compact?: boolean
  }>(),
  { compact: false },
)

const appConfig = useAppConfig()


const items = computed(() => [
  [
    {
      label: 'Light',
      icon: 'i-lucide-sun',
      slot: 'theme',
    },
    {
      label: 'Dark',
      icon: 'i-lucide-moon',
      slot: 'primary-color',
    },
  ],
])

onMounted(() => {
  const saved = localStorage.getItem('nuxt-ui-primary')
  if (saved) {
    appConfig.ui.colors.primary = saved
  }
})

function setPrimary(color: string) {
  appConfig.ui.colors.primary = color
  localStorage.setItem('nuxt-ui-primary', color)
}
</script>
