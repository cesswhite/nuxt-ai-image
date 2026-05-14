<template>
  <!-- UDashboardPanel must live under UDashboardGroup (layout) so resize/context and navbar toggle work. -->
  <UDashboardPanel
    id="dashboard-studio"
    class="min-h-0 min-w-0 flex-1 flex-col"
    :ui="studioPanelUi"
  >
    <template #header>
      <!-- Mobile: `UDashboardNavbar` (includes `UDashboardSidebarToggle`); desktop: Relight full-bleed — hide bar from `lg` up -->
      <DashboardPageNavbar
        title="Studio"
        class="lg:hidden"
      />
    </template>

    <template #body>
      <DashboardStudioContainer />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

/** Tighter panel chrome when header is hidden on large breakpoints */
const studioPanelUi = {
  root: 'flex min-h-0 flex-1 flex-col',
  body: 'flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-hidden py-0! px-0! lg:pt-0',
}

useSeoMeta({
  title: 'Studio | Nuxt AI Images',
  description: 'AI image generation — Relight-style dashboard layout.',
})
</script>
