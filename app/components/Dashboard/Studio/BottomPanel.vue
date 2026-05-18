<template>
  <div
    class="pointer-events-none fixed bottom-0 left-1/2 z-20 -translate-x-1/2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-[width] duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]"
    :class="collapsed ? 'w-[min(92vw,14rem)]' : 'w-[min(96vw,42rem)]'">
    <div ref="panelRef" v-motion :initial="panelVariants.initial" :enter="panelVariants.enter" :variants="panelVariants"
      class="origin-bottom will-change-transform">
      <UCard id="studio-composer-panel" variant="subtle"
        :ui="{ root: 'rounded-[1.75rem]', body: collapsed ? 'p-2 sm:p-2' : 'p-3 sm:p-4' }"
        class="pointer-events-auto border-default/80 shadow-lg shadow-default/15 ring-default/60 backdrop-blur-md">
        <template v-if="collapsed">
          <UTooltip text="Open prompt and settings" :content="{ side: 'top' }" :delay-duration="0">
            <UButton block variant="soft" color="neutral" size="md" class="cursor-pointer gap-2 rounded-2xl"
              icon="i-lucide-chevrons-up" label="Expand" :loading="studio.loading" aria-controls="studio-composer-panel"
              :aria-expanded="false" @click="openPanel" />
          </UTooltip>
        </template>

        <div v-else class="flex flex-col gap-3">
          <div class="flex items-center justify-end gap-1">
            <DashboardStudioLeftPanelAppearanceMenu compact />
            <UTooltip text="Minimize composer" :content="{ side: 'top' }" :delay-duration="0">
              <UButton variant="ghost" color="neutral" size="xs" square class="cursor-pointer shrink-0"
                icon="i-lucide-chevrons-down" aria-controls="studio-composer-panel" :aria-expanded="true"
                @click="closePanel" />
            </UTooltip>
          </div>

          <div
            class="flex min-h-30 flex-col rounded-2xl border border-default bg-elevated/40 p-3 ring ring-default/40 backdrop-blur-sm">
            <UTextarea v-model="studio.prompt" variant="outline" :rows="3" autoresize :maxlength="4000"
              placeholder="Describe your image: subject, setting, lighting, style…" class="w-full flex-1 bg-transparent"
              :disabled="studio.loading || studio.loadingGpt || studio.loadingSurprise" :ui="{
                base: 'resize-none border-0 bg-transparent ring-0 focus:ring-0 rounded-lg p-0 text-sm placeholder:text-dimmed max-h-40',
              }" />
            <div class="mt-2 flex w-full items-end justify-between gap-2">
              <span class="select-none text-xs text-dimmed tabular-nums">
                {{ studio.prompt.length }}/4000
              </span>
              <div class="flex items-center gap-1">
                <UTooltip text="Enhance prompt" :content="{ side: 'top' }" :delay-duration="0">
                  <UButton type="button" variant="ghost" color="neutral" size="xs" square icon="i-lucide-sparkles"
                    class="cursor-pointer"
                    :disabled="studio.loading || studio.loadingGpt || studio.loadingSurprise || !studio.prompt.trim()"
                    :loading="studio.loadingGpt" aria-label="Enhance prompt" @click="handleEnhancePrompt" />
                </UTooltip>
                <UTooltip text="Surprise prompt" :content="{ side: 'top' }" :delay-duration="0">
                  <UButton type="button" variant="ghost" color="neutral" size="xs" square icon="i-lucide-wand-2"
                    class="cursor-pointer" :disabled="studio.loading || studio.loadingGpt || studio.loadingSurprise"
                    :loading="studio.loadingSurprise" aria-label="Surprise me with a random prompt"
                    @click="handleSurprisePrompt" />
                </UTooltip>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 border-t border-default/50 pt-3">
            <DashboardStudioFieldDropdown v-model="studio.provider" :items="providerMenuItems"
              :disabled="studio.loading" placeholder="Provider…" :block="false"
              button-class="w-[9.5rem] shrink-0 rounded-full" />
            <DashboardStudioFieldDropdown v-model="studio.model" :items="modelItems" :disabled="studio.loading"
              placeholder="Model…" :block="false" button-class="min-w-[9rem] max-w-full flex-1 rounded-full" />
            <DashboardStudioFieldDropdown
              v-if="studio.provider === 'google-gemini' && isNanobanana2"
              v-model="studio.aspectRatio"
              :items="geminiAspectItems" :disabled="studio.loading" placeholder="Ratio…" :block="false"
              button-class="min-w-[7.5rem] shrink-0 rounded-full" />
          </div>

          <div class="max-h-[min(38vh,18rem)] overflow-y-auto overflow-x-hidden border-t border-default/40 pt-3">
            <DashboardStudioLeftPanelModelsNanobanana2Form v-if="isNanobanana2" />
            <DashboardStudioLeftPanelModelsNanobananaProForm v-if="isNanobananaPro" />
            <DashboardStudioLeftPanelModelsNanobanana25Form v-if="isNanobanana25" />
            <DashboardStudioLeftPanelModelsOpenaiForm :is-open-ai15="isOpenAi15" :is-open-ai2="isOpenAi2" />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReducedMotion } from '@vueuse/motion'
import type { StudioFieldDropdownItem } from '~/components/Dashboard/Studio/FieldDropdown.vue'
import {
  studioModelSelectItems,
  studioProviderSelectItems,
} from '~/utils/studioImageModels'
import { geminiAspectSelectItemsForModel } from '~/utils/geminiAspectRatios'

const easeOutExpo = [0.19, 1, 0.22, 1] as const

const panelVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 300,
      ease: easeOutExpo,
    },
  },
  expanded: {
    y: -14,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 280,
      ease: easeOutExpo,
    },
  },
  collapsed: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 260,
      ease: easeOutExpo,
    },
  },
} as const

const studio = useStudioStore()
const collapsed = ref(false)
const prefersReducedMotion = useReducedMotion()
const panelRef = ref<HTMLElement | null>(null)

const { handleEnhancePrompt, handleSurprisePrompt } = useStudioPromptAssist()

const {
  isNanobanana2,
  isNanobananaPro,
  isNanobanana25,
  isOpenAi15,
  isOpenAi2,
} = useStudioInputsModelFlags()

useStudioInputsSync()

const geminiAspectItems = computed<StudioFieldDropdownItem[]>(() =>
  geminiAspectSelectItemsForModel(studio.model).map((row) => ({
    ...row,
    icon: 'i-lucide-ratio',
  })),
)

const providerMenuItems = studioProviderSelectItems('composer')

const modelItems = computed(() => studioModelSelectItems(studio.provider))

type PanelMotion = {
  apply: (v: string) => Promise<unknown>
  set: (v: string) => void
}

function panelMotion(): PanelMotion | undefined {
  const el = panelRef.value as (HTMLElement & { motionInstance?: PanelMotion }) | null
  return el?.motionInstance
}

function runMotionVariant(variant: 'expanded' | 'collapsed') {
  const inst = panelMotion()
  if (!inst) return
  if (prefersReducedMotion.value) {
    inst.set(variant)
  } else {
    void inst.apply(variant)
  }
}

function openPanel() {
  if (!collapsed.value) return
  collapsed.value = false
  nextTick(() => runMotionVariant('expanded'))
}

function closePanel() {
  if (collapsed.value) return
  collapsed.value = true
  nextTick(() => runMotionVariant('collapsed'))
}
</script>
