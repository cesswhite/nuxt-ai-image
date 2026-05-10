<template>
  <UDashboardGroup
    class="min-h-svh w-full min-w-0 flex-1"
    storage-key="nuxt-ai-images-dashboard"
  >
    <DashboardSidebarContainer />
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <slot />
    </div>
  </UDashboardGroup>
</template>
