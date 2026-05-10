<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
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
          For local demos without API keys, set
          <code class="rounded bg-elevated px-1 py-0.5 text-xs text-default">NUXT_PUBLIC_IMAGE_GEN_DEMO=true</code>.
        </li>
        <li>
          For production, set provider keys and implement
          <code class="rounded bg-elevated px-1 py-0.5 text-xs text-default">server/api/generate-image.post.ts</code>
          — see <code class="text-xs text-default">docs/IMAGE_PIPELINE.md</code>.
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

useSeoMeta({
  title: 'Settings | Nuxt AI Images',
  description: 'Configure API keys and demo mode for the Nuxt AI Images template.',
})
</script>
