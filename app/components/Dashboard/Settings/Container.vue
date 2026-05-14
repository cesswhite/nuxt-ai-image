<template>
    <div class="space-y-8">
        <section class="space-y-3">
            <div class="px-1">
                <h3 class="text-sm font-medium text-highlighted">
                    Theme
                </h3>
                <p class="mt-0.5 text-xs text-dimmed">
                    Switch between light and dark. Preference is stored in this browser.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-3 px-1">
                <UColorModeButton color="neutral" variant="outline" class="cursor-pointer" />
            </div>
        </section>

        <section class="space-y-3">
            <div class="px-1">
                <h3 class="text-sm font-medium text-highlighted">
                    Accent &amp; neutral palette
                </h3>
                <p class="mt-0.5 text-xs text-dimmed">
                    Primary color scale and gray scale used across buttons, rings, and UI accents.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-3 px-1">
                <AppSwitchPrimaryColor />
            </div>
        </section>
    </div>
</template>
