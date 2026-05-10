<template>
  <USidebar
    v-model:open="open"
    collapsible="icon"
    variant="inset"
    rail
    :ui="{
      container: 'h-full',
      inner: 'divide-transparent',
      body: 'py-0',
    }"
  >
    <template #header>
      <div class="flex min-w-0 items-center gap-2 px-1">
        <NuxtLink to="/dashboard" class="flex min-w-0 items-center gap-2">
          <AppLogo class="h-5 w-auto shrink-0" />
        </NuxtLink>
      </div>
    </template>

    <template #default="{ state }">
      <UNavigationMenu
        :key="state"
        type="single"
        :items="navItems"
        orientation="vertical"
        :ui="{ link: 'p-1.5 overflow-hidden' }"
      />
    </template>

    <template #footer>
      <div class="px-1">
        <UButton
          to="/"
          color="neutral"
          variant="ghost"
          block
          leading-icon="i-lucide-arrow-left"
          label="Home"
          class="justify-start overflow-hidden"
        />
      </div>
    </template>
  </USidebar>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = useDashboardSidebarOpen()

/** Keeps `USidebar` in sync with `UDashboardSidebarToggle` / `UDashboardNavbar` (same hook as `UDashboardSidebar`). */
useRuntimeHook('dashboard:sidebar:toggle', () => {
  open.value = !open.value
})

const navItems: NavigationMenuItem[] = [
  { label: 'Studio', icon: 'i-lucide-image', to: '/dashboard' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' },
]
</script>
