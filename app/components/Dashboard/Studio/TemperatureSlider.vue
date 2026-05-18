<template>
  <div class="flex w-full items-center gap-3">
    <USlider
      v-model="model"
      :min="min"
      :max="max"
      :step="step"
      size="sm"
      color="primary"
      tooltip
      class="min-w-0 flex-1"
      :disabled="disabled"
    />
    <span class="w-11 shrink-0 text-right text-xs tabular-nums text-dimmed">
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    min?: number
    max?: number
    step?: number
  }>(),
  {
    disabled: false,
    min: 0,
    max: 1,
    step: 0.05,
  },
)

const model = defineModel<number>({ required: true })

const displayValue = computed(() => {
  const decimals = props.step >= 0.1 ? 1 : 2
  return String(parseFloat(model.value.toFixed(decimals)))
})
</script>
