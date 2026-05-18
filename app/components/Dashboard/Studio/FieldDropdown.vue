<template>
  <UDropdownMenu :items="menuItems" :disabled="disabled">
    <UTooltip
      :text="tooltip || placeholder || 'Open menu'"
      class="cursor-help inline-block"
      :content="{ side: 'top' }"
      :delay-duration="0"
    >
      <UButton
        color="neutral"
        variant="outline"
        :disabled="disabled"
        :block="block"
        square
        class="inline-flex size-8 shrink-0 items-center justify-center p-0"
        :class="buttonClass"
        :aria-label="placeholder || tooltip || 'Open menu'"
      >
        <template #leading>
          <UIcon :name="triggerIcon" class="size-4 shrink-0 text-highlighted" />
        </template>
      </UButton>
    </UTooltip>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

/** Row in the menu; `icon` is optional (e.g. aspect ratios are label/value only). */
export type StudioFieldDropdownItem = {
  label: string
  value: string | number
  icon?: string
}

const props = withDefaults(
  defineProps<{
    items: StudioFieldDropdownItem[]
    disabled?: boolean
    block?: boolean
    /** Extra classes on the trigger (e.g. rounded-full, width). */
    buttonClass?: string | null
    placeholder?: string
    tooltip?: string
    /**
     * Fallback trigger icon when the selected item has no `icon`
     * and no matching row supplies one.
     */
    icon?: string
  }>(),
  {
    disabled: false,
    block: true,
    buttonClass: null,
    placeholder: '',
    tooltip: '',
    icon: undefined,
  },
)

const model = defineModel<string | number>({ required: true })

/** Prefer the selected option’s icon, then explicit `icon` prop, then a neutral picker glyph. */
const triggerIcon = computed(() => {
  const selected = props.items.find((i) => i.value === model.value)
  if (selected?.icon) return selected.icon
  if (props.icon) return props.icon
  return 'i-lucide-chevrons-up-down'
})

const menuItems = computed<DropdownMenuItem[][]>(() => [
  props.items.map((item) => {
    const row: DropdownMenuItem = {
      label: item.label,
      onSelect() {
        model.value = item.value
      },
    }
    if (item.value === model.value) {
      row.icon = 'i-lucide-check'
    }
    else if (item.icon) {
      row.icon = item.icon
    }
    return row
  }),
])
</script>
