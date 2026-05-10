# Animation (VueUse Motion + design habits)

## Module

`@vueuse/motion/nuxt` is registered in `nuxt.config.ts`. Use **`v-motion`** with `initial` / `enter` / `visible` and **`duration`** in the ~240–320 ms range for dashboard surfaces.

## Rules of thumb

- **Enter / exit** → ease-out (responsive feel).
- **On-screen motion** → ease-in-out.
- **Hover** → ease, short duration.
- Prefer animating **`opacity`** and **`transform`** only (GPU-friendly).
- Avoid linear easing for UI; avoid **ease-in** for entrances (feels sluggish).

## Accessibility

Honor **prefers-reduced-motion**: prefer shorter or disabled motion for users who request it. VueUse Motion can be extended per-component; for new features, check `@vueuse/core` `usePreferredReducedMotion` and branch variants.

## Dashboard

Studio page uses light motion on the outer wrapper and cards. Keep new animations **subtle** — users will run generate many times; avoid distracting loops.
