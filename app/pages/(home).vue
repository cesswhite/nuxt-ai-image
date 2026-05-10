<template>
  <NuxtLayout name="default">
    <section
      class="flex min-h-dvh flex-col items-center justify-center gap-10 px-4 py-16"
    >
      <div
        v-motion
        class="flex max-w-lg flex-col items-center gap-4 text-center"
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        :duration="320"
      >
        <div class="size-14 shrink-0">
          <AppLogo class="size-full" />
        </div>
        <h1 class="text-balance text-3xl font-semibold tracking-tight text-highlighted md:text-4xl">
          Nuxt AI Images
        </h1>
        <p class="text-pretty text-base text-dimmed md:text-lg">
          Anchor template for AI image products: Nuxt UI dashboard shell, server-side OpenAI / Gemini generation, performance and AI-search docs, and Cursor skills.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/dashboard"
            size="lg"
            color="primary"
            icon="i-lucide-layout-dashboard"
            class="cursor-pointer"
          >
            Open studio
          </UButton>
          <UColorModeButton color="neutral" variant="outline" class="cursor-pointer" />
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const site = config.public.siteUrl || ''

useSeoMeta({
  title: 'Nuxt AI Images — AI image generation template',
  description: 'Minimal Nuxt 4 + Nuxt UI dashboard for OpenAI and Google image pipelines. Clone as the base for new AI image apps.',
  ogTitle: 'Nuxt AI Images — AI image generation template',
  ogDescription: 'Minimal Nuxt 4 + Nuxt UI dashboard for OpenAI and Google image pipelines.',
  ...(site ? { ogUrl: site } : {}),
  twitterCard: 'summary_large_image',
})
</script>
