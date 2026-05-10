<template>
  <div class="flex h-dvh min-h-dvh w-full overflow-hidden bg-default">
    <USidebar
      v-model:open="sidebarOpen"
      collapsible="icon"
      variant="inset"
      class="border-default"
    >
      <template #header="{ open: isOpen }">
        <div
          class="flex w-full items-center justify-between gap-2 px-2"
          :class="{ 'flex-col gap-3': !isOpen }"
        >
          <NuxtLink
            to="/dashboard"
            class="flex min-w-0 flex-1 items-center gap-2"
          >
            <div class="size-8 shrink-0">
              <AppLogo class="size-full" />
            </div>
            <div v-if="isOpen" class="min-w-0">
              <span class="block truncate text-sm font-semibold text-highlighted">AI Images</span>
              <span class="block truncate text-xs text-dimmed">Studio template</span>
            </div>
          </NuxtLink>
          <UButton
            icon="i-lucide-panel-left"
            color="neutral"
            variant="ghost"
            square
            size="sm"
            class="cursor-pointer shrink-0"
            aria-label="Toggle sidebar"
            @click="sidebarOpen = !sidebarOpen"
          />
        </div>
      </template>

      <template #default>
        <nav
          class="mt-2 flex flex-col gap-0.5 px-1 pb-4"
          aria-label="Main"
        >
          <template v-if="sidebarOpen">
            <UButton
              to="/dashboard"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              icon="i-lucide-sparkles"
              label="Studio"
              class="cursor-pointer justify-start"
              active-class="bg-elevated text-highlighted"
            />
            <UButton
              to="/dashboard/settings"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              icon="i-lucide-settings"
              label="Settings"
              class="cursor-pointer justify-start"
              active-class="bg-elevated text-highlighted"
            />
          </template>
          <template v-else>
            <UTooltip text="Studio">
              <UButton
                to="/dashboard"
                variant="ghost"
                color="neutral"
                size="md"
                square
                icon="i-lucide-sparkles"
                class="w-full cursor-pointer"
                :ui="{ base: 'justify-center' }"
                aria-label="Studio"
                active-class="bg-elevated text-highlighted"
              />
            </UTooltip>
            <UTooltip text="Settings">
              <UButton
                to="/dashboard/settings"
                variant="ghost"
                color="neutral"
                size="md"
                square
                icon="i-lucide-settings"
                class="w-full cursor-pointer"
                :ui="{ base: 'justify-center' }"
                aria-label="Settings"
                active-class="bg-elevated text-highlighted"
              />
            </UTooltip>
          </template>
        </nav>
      </template>

      <template #footer>
        <div
          class="flex items-center gap-2 p-2"
          :class="sidebarOpen ? 'justify-between' : 'flex-col'"
        >
          <UColorModeButton color="neutral" variant="ghost" class="cursor-pointer" />
          <LazyAppSwitchPrimaryColor />
        </div>
      </template>
    </USidebar>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header
        class="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-default bg-default/80 px-4 backdrop-blur-md md:px-6"
      >
        <div class="min-w-0">
          <p class="text-xs text-dimmed">
            Nuxt UI dashboard shell
          </p>
          <h1 class="truncate text-base font-semibold text-highlighted">
            {{ shellTitle }}
          </h1>
        </div>
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-house"
          label="Home"
          class="cursor-pointer max-sm:hidden"
        />
      </header>

      <main class="scrollbar-hide flex-1 overflow-y-auto p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
const route = useRoute()

const shellTitle = computed(() => {
  if (route.path.startsWith('/dashboard/settings')) return 'Settings'
  return 'Studio'
})
</script>
