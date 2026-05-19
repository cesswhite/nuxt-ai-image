<template>
  <DashboardStudioContentFieldDropdown
    :disabled="disabled"
    :block="block"
    :button-class="buttonClass"
    :placeholder="placeholder"
    :tooltip="tooltipText"
    :icon="icon"
    content-ui="w-52 p-3"
  >
    <DashboardStudioTemperatureSlider
      v-model="model"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
    />
  </DashboardStudioContentFieldDropdown>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    block?: boolean
    buttonClass?: string | null
    placeholder?: string
    tooltip?: string
    icon?: string
    min?: number
    max?: number
    step?: number
  }>(),
  {
    disabled: false,
    block: true,
    buttonClass: null,
    placeholder: 'Temperature',
    tooltip: '',
    icon: 'i-lucide-thermometer',
    min: 0,
    max: 1,
    step: 0.05,
  },
)

const model = defineModel<number>({ required: true })

const tooltipText = computed(() => {
  const base = (props.tooltip || props.placeholder || 'Value').replace(/…$/, '').trim()
  const decimals = props.step >= 0.1 ? 1 : 2
  const value = parseFloat(model.value.toFixed(decimals))
  return `${base} · ${value}`
})
</script>
