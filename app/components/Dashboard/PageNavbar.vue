<script setup lang="ts">
/**
 * Mirrors Nananuxt `Dashboard/PageNavbar.vue`: forwards slots to `UDashboardNavbar`.
 * Parent page must be under **`UDashboardGroup`** (see `layouts/dashboard.vue`) so `UDashboardSidebarToggle` works.
 */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const slots = useSlots()

const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter((n) => n !== 'toggle'),
)
</script>

<template>
  <UDashboardNavbar v-bind="attrs">
    <template v-for="name in forwardedSlotNames" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope ?? {}" />
    </template>
  </UDashboardNavbar>
</template>
