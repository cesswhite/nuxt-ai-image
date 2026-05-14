<template>
  <UDashboardPanel id="dashboard-settings" class="flex min-h-0 min-w-0 flex-1 flex-col" :ui="{
    root: 'flex flex-col flex-1 min-h-0',
    body: 'flex flex-1 flex-col min-h-0 overflow-y-auto px-2 py-2 md:px-4 md:py-4',
  }">
    <template #header>
      <DashboardPageNavbar title="Settings" />
    </template>

    <template #body>
      <div class="mx-auto max-w-2xl space-y-6">
        <UCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2 px-1">
              <UIcon name="i-lucide-paintbrush" class="size-5 text-primary" />
              <span class="font-medium text-highlighted">Appearance</span>
            </div>
          </template>
          <DashboardSettingsContainer />
        </UCard>

        <UCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2 px-1">
              <UIcon name="i-lucide-key-round" class="size-5 text-primary" />
              <span class="font-medium text-highlighted">Environment</span>
            </div>
          </template>
          <ul class="list-inside list-disc space-y-2 text-sm text-dimmed">
            <li>
              Copy <code class="rounded bg-elevated px-1 py-0.5 text-xs text-default">.env.example</code> to
              <code class="rounded bg-elevated px-1 py-0.5 text-xs text-default">.env</code>.
            </li>
            <li>
              <strong>Enhance prompt</strong> and <strong>Surprise me</strong> use OpenAI chat (same <code
                class="rounded bg-elevated px-1 py-0.5 text-xs text-default">OPENAI_API_KEY</code>; optional <code
                class="text-xs text-default">OPENAI_PROMPT_MODEL</code>).
            </li>
            <li>
              Set <code class="rounded bg-elevated px-1 py-0.5 text-xs text-default">OPENAI_API_KEY</code> and/or Gemini
              keys
              for the image provider you use in the studio.
            </li>
            <li>
              Generation is implemented in
              <code class="rounded bg-elevated px-1 py-0.5 text-xs text-default">server/api/image/*.post.ts</code>;
              details in <code class="text-xs text-default">docs/IMAGE_PIPELINE.md</code>.
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

useSeoMeta({
  title: 'Settings | Nuxt AI Images',
  description: 'Configure API keys for Nuxt AI Images.',
})
</script>
