import type { StudioProvider } from '~/types/studio'

/**
 * Allowed image model IDs per provider for studio / **`POST /api/image/*`** routes.
 *
 * **Google Gemini — use native image models only.** This route calls `generateContent` with
 * image output (`responseModalities: ['TEXT', 'IMAGE']`). Do **not** use general Gemini 3 **text**
 * models here — e.g. **`gemini-3-flash-preview`**, **`gemini-3.1-pro-preview`**, **`gemini-3.1-flash-lite`**
 * (outputs text; image generation not supported — see
 * [Gemini models](https://ai.google.dev/gemini-api/docs/models/gemini)). **`gemini-3.1-flash-lite`**
 * is easy to confuse with **`gemini-3.1-flash-image-preview`** (“-lite” vs “-flash-image-”).
 * Image-capable IDs use `…-image…` / `…-flash-image` (e.g. `gemini-2.5-flash-image`).
 *
 * Keep in sync with `server/api/image/*.post.ts` and `app/utils/geminiAspectRatios.ts`.
 */
type StudioImageModelDef = {
  readonly key: string
  readonly id: string
  readonly label: string
  readonly provider: StudioProvider
  readonly icon?: string
}

const STUDIO_IMAGE_MODEL_REGISTRY = [
  {
    key: 'NANOBANANA2',
    id: 'gemini-3.1-flash-image-preview',
    label: 'Nanobanana 2',
    provider: 'google-gemini',
    icon: 'i-icon-park-outline-banana',
  },
  {
    key: 'NANOBANANA_PRO',
    id: 'gemini-3-pro-image-preview',
    label: 'Nanobanana Pro',
    provider: 'google-gemini',
    icon: 'i-hugeicons-banana',
  },
  {
    key: 'NANOBANANA_25',
    id: 'gemini-2.5-flash-image',
    label: 'Nanobanana',
    provider: 'google-gemini',
    icon: 'i-streamline-ultimate-fruit-banana',
  },
  {
    key: 'GPT_IMAGE_15',
    id: 'gpt-image-1.5',
    label: 'GPT Image 1.5',
    provider: 'openai',
    icon: 'i-simple-icons-openai',
  },
  {
    key: 'GPT_IMAGE_2',
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    provider: 'openai',
    icon: 'i-simple-icons-openai',
  },
] as const satisfies readonly StudioImageModelDef[]

type StudioImageModelRegistryEntry = (typeof STUDIO_IMAGE_MODEL_REGISTRY)[number]
export type StudioImageModelKey = StudioImageModelRegistryEntry['key']
export type StudioImageModelId = StudioImageModelRegistryEntry['id']
export type GeminiImageModelId = Extract<StudioImageModelRegistryEntry, { provider: 'google-gemini' }>['id']
export type OpenAIImageModelId = Extract<StudioImageModelRegistryEntry, { provider: 'openai' }>['id']

/** Canonical model IDs for studio UI and generate body branching. */
export const STUDIO_IMAGE_MODEL = Object.fromEntries(
  STUDIO_IMAGE_MODEL_REGISTRY.map((m) => [m.key, m.id]),
) as { readonly [K in StudioImageModelKey]: Extract<StudioImageModelRegistryEntry, { key: K }>['id'] }

/** UI labels; API still uses `id` as `value`. */
export const STUDIO_IMAGE_MODEL_LABELS: Record<StudioImageModelId, string> = Object.fromEntries(
  STUDIO_IMAGE_MODEL_REGISTRY.map((m) => [m.id, m.label]),
) as Record<StudioImageModelId, string>

const STUDIO_IMAGE_MODEL_BY_ID = new Map<StudioImageModelId, StudioImageModelRegistryEntry>(
  STUDIO_IMAGE_MODEL_REGISTRY.map((m) => [m.id, m]),
)

function modelIdsForProvider(provider: StudioProvider): StudioImageModelId[] {
  return STUDIO_IMAGE_MODEL_REGISTRY
    .filter((m) => m.provider === provider)
    .map((m) => m.id)
}

const ALLOWED_MODEL_IDS_BY_PROVIDER: Record<StudioProvider, ReadonlySet<string>> = {
  'google-gemini': new Set(modelIdsForProvider('google-gemini')),
  openai: new Set(modelIdsForProvider('openai')),
}

export const GEMINI_IMAGE_MODEL_IDS = modelIdsForProvider('google-gemini') as readonly GeminiImageModelId[]
export const OPENAI_IMAGE_MODEL_IDS = modelIdsForProvider('openai') as readonly OpenAIImageModelId[]

/** Nuxt Icon names (`i-{collection}-{icon}`). Requires matching `@iconify-json/*` packages. */
export const STUDIO_PROVIDER_ICONS: Record<StudioProvider, string> = {
  'google-gemini': 'i-simple-icons-googlegemini',
  openai: 'i-simple-icons-openai',
}

export type StudioImageSelectItem = {
  label: string
  value: string
  icon: string
}

export type StudioProviderMenuVariant = 'composer' | 'sidebar'

const STUDIO_PROVIDER_LABELS: Record<
  StudioProviderMenuVariant,
  Record<StudioProvider, string>
> = {
  composer: {
    'google-gemini': 'Gemini',
    openai: 'GPT Image',
  },
  sidebar: {
    'google-gemini': 'Google - Gemini',
    openai: 'OpenAI - GPT',
  },
}

export function studioProviderIcon(provider: StudioProvider): string {
  return STUDIO_PROVIDER_ICONS[provider]
}

/** Per-model icon when defined in the registry; otherwise the provider icon. */
export function studioModelIcon(
  modelId: string,
  provider: StudioProvider,
): string {
  const entry = STUDIO_IMAGE_MODEL_BY_ID.get(modelId as StudioImageModelId)
  return entry?.icon ?? studioProviderIcon(provider)
}

export function studioProviderSelectItems(
  variant: StudioProviderMenuVariant = 'composer',
): StudioImageSelectItem[] {
  return (Object.keys(STUDIO_PROVIDER_ICONS) as StudioProvider[]).map((provider) => ({
    value: provider,
    label: STUDIO_PROVIDER_LABELS[variant][provider],
    icon: studioProviderIcon(provider),
  }))
}

export function studioModelSelectItems(
  provider: StudioProvider,
): StudioImageSelectItem[] {
  return modelIdsForProvider(provider).map((id) => ({
    value: id,
    label: STUDIO_IMAGE_MODEL_LABELS[id],
    icon: studioModelIcon(id, provider),
  }))
}

export function defaultModelForProvider(provider: StudioProvider): StudioImageModelId {
  const entry = STUDIO_IMAGE_MODEL_REGISTRY.find((m) => m.provider === provider)
  if (!entry) {
    throw new Error(`No default image model for provider "${provider}".`)
  }
  return entry.id
}

export function isAllowedStudioModel(
  provider: StudioProvider,
  model: string,
): boolean {
  return ALLOWED_MODEL_IDS_BY_PROVIDER[provider].has(model.trim())
}
