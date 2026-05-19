import { usePreferredReducedMotion } from '@vueuse/core'
import Panzoom from '@panzoom/panzoom'
import type { PanzoomObject, PanzoomOptions } from '@panzoom/panzoom'

const PANZOOM_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function useStudioPreviewPanzoom(
  viewportRef: Ref<HTMLElement | null>,
  targetRef: Ref<HTMLElement | null>,
  imageSrc: Ref<string>,
) {
  const reducedMotion = usePreferredReducedMotion()

  let instance: PanzoomObject | null = null
  let wheelTarget: HTMLElement | null = null

  const isZoomed = ref(false)

  const panzoomOptions = computed((): PanzoomOptions => {
    const animate = reducedMotion.value !== 'reduce'
    return {
      maxScale: 6,
      minScale: 1,
      step: 0.06,
      animate,
      duration: animate ? 280 : 0,
      easing: PANZOOM_EASING,
      contain: 'outside',
      cursor: 'grab',
      canvas: true,
      touchAction: 'none',
      panOnlyWhenZoomed: true,
      disableZoom: false,
    }
  })

  function syncZoomedState() {
    if (!instance) {
      isZoomed.value = false
      return
    }
    isZoomed.value = instance.getScale() > 1.02
  }

  function destroy() {
    if (wheelTarget && instance) {
      wheelTarget.removeEventListener('wheel', instance.zoomWithWheel)
    }
    instance?.destroy()
    instance = null
    wheelTarget = null
    isZoomed.value = false
  }

  function bind() {
    destroy()
    const target = targetRef.value
    const viewport = viewportRef.value
    if (!target || !viewport) return

    instance = Panzoom(target, panzoomOptions.value)
    wheelTarget = viewport
    viewport.addEventListener('wheel', instance.zoomWithWheel, { passive: false })
    target.addEventListener('panzoomchange', syncZoomedState)
    target.addEventListener('panzoomend', syncZoomedState)
    syncZoomedState()
  }

  function resetView(animate?: boolean) {
    if (!instance) return
    const shouldAnimate = animate ?? reducedMotion.value !== 'reduce'
    instance.reset({ animate: shouldAnimate })
    syncZoomedState()
  }

  watch(
    () => reducedMotion.value,
    () => {
      if (instance) bind()
    },
  )

  watch(imageSrc, () => {
    nextTick(() => resetView(false))
  })

  onMounted(() => {
    nextTick(bind)
  })

  watch([viewportRef, targetRef], () => {
    nextTick(bind)
  })

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    isZoomed,
    resetView,
  }
}
