<template>
  <UPopover :content="{ side: 'top', align: 'center' }" :ui="{ content: contentUi }" :modal="false">
    <UTooltip
      :text="tooltip"
      :disabled="!tooltip"
      class="inline-flex cursor-help"
      :content="{ side: 'top' }"
      :delay-duration="0"
    >
      <UButton
        color="neutral"
        variant="outline"
        :disabled="disabled"
        :block="block"
        square
        class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center p-0"
        :class="buttonClass"
        :aria-label="placeholder"
      >
        <template #leading>
          <UIcon :name="icon" class="size-4 shrink-0 text-highlighted" />
        </template>
      </UButton>
    </UTooltip>

    <template #content>
      <div class="space-y-2" @pointerdown.stop @click.stop>
        <slot />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean
    block?: boolean
    buttonClass?: string | null
    placeholder?: string
    tooltip?: string
    icon?: string
    /** Popover panel width / padding (Tailwind classes). */
    contentUi?: string
  }>(),
  {
    disabled: false,
    block: true,
    buttonClass: null,
    placeholder: 'Options',
    tooltip: '',
    icon: 'i-lucide-settings-2',
    contentUi: 'w-56 p-3',
  },
)
</script>
