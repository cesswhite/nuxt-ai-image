import { useLocalStorage } from '@vueuse/core'

const STORAGE_KEY = 'nuxt-ai-images-sidebar-open'

/**
 * Same pattern as Nananuxt: shared `USidebar` open state, persisted for desktop/mobile.
 */
export function useDashboardSidebarOpen() {
  return useLocalStorage(STORAGE_KEY, true)
}
