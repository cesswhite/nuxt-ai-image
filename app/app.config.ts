/**
 * Aligned with Screenlify + Nananuxt: emerald/zinc, `beautify` primary CTAs,
 * subtle cards, outlined form controls (ring + shadow).
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc',
    },
    icons: {
      light: 'i-lucide-sun',
      dark: 'i-lucide-moon',
    },
    button: {
      variants: {
        variant: {
          solid: '',
          outline: '',
          soft: '',
          subtle: '',
          ghost: '',
          link: '',
          beautify: '',
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'beautify',
          class:
            'text-inverted/90 font-semibold transform-gpu bg-linear-to-t from-primary-500/95 to-primary-400/95 dark:from-primary-400/95 dark:to-primary-300/95 shadow-sm ring-1 ring-primary-300/40 dark:ring-primary-700/40 rounded-lg will-change-transform hover:from-primary-500 hover:to-primary-400 hover:text-inverted hover:shadow-md dark:hover:from-primary-400 dark:hover:to-primary-300 active:saturate-150 active:scale-[0.98] disabled:opacity-50 aria-disabled:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-100 ease-out reduce-motion:transition-none',
        },
        {
          color: 'error',
          variant: 'beautify',
          class:
            'text-inverted/90 font-semibold! transform-gpu bg-linear-to-t from-error-500/95 to-error-400/95 dark:from-error-400/95 dark:to-error-300/95 shadow-sm ring-1 ring-error-300/40 dark:ring-error-700/40 rounded-lg will-change-transform hover:from-error-500 hover:to-error-400 hover:text-inverted hover:shadow-md dark:hover:from-error-400 dark:hover:to-error-300 active:saturate-150 active:scale-[0.98] disabled:opacity-50 aria-disabled:bg-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error transition-all duration-100 ease-out reduce-motion:transition-none',
        },
      ],
    },
    card: {
      slots: {
        header: 'p-0 sm:px-3! sm:py-1 tracking-tight text-opacity-90',
        body: 'sm:p-2 mt-2',
      },
      variants: {
        variant: {
          subtle: {
            root: 'bg-elevated ring ring-default/70 shadow-sm divide-none rounded-lg',
          },
        },
      },
    },
    input: {
      variants: {
        variant: {
          outline:
            'text-highlighted bg-default ring ring-accented/70 shadow-sm shadow-dark-500/10 hover:bg-elevated/60 disabled:bg-default cursor-pointer rounded-lg',
        },
      },
    },
    select: {
      slots: {
        item: 'cursor-pointer data-disabled:cursor-not-allowed',
        itemTrailingIcon: '!size-3 shrink-0 text-primary-500 dark:text-primary-400 mt-0.5',
      },
      variants: {
        variant: {
          outline:
            'text-highlighted bg-default ring ring-accented/70 shadow-sm shadow-dark-500/10 hover:bg-elevated/60 disabled:bg-default cursor-pointer rounded-lg',
        },
      },
    },
    selectMenu: {
      slots: {
        item: 'cursor-pointer data-disabled:cursor-not-allowed',
        itemTrailingIcon: '!size-3 shrink-0 text-primary-500 dark:text-primary-400',
      },
      variants: {
        variant: {
          outline:
            'text-highlighted bg-default ring ring-accented/70 shadow-sm shadow-dark-500/10 hover:bg-elevated/60 disabled:bg-default cursor-pointer rounded-lg',
        },
      },
    },
    textarea: {
      variants: {
        variant: {
          outline:
            'text-highlighted bg-default ring ring-accented/70 shadow-sm shadow-dark-500/10 hover:bg-elevated/60 disabled:bg-default cursor-pointer rounded-lg',
        },
      },
    },
  },
})
