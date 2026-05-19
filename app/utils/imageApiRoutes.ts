/**
 * **One POST route per image model** — slugs use hyphens instead of dots in model IDs.
 * Keep in sync with `server/api/image/*.post.ts` and `app/utils/studioImageModels.ts`.
 */
import {
  GEMINI_IMAGE_MODEL_IDS,
  OPENAI_IMAGE_MODEL_IDS,
  type StudioImageModelId,
} from '~/utils/studioImageModels'

/** `gemini-3.1-flash-image-preview` → `gemini-3-1-flash-image-preview` */
export function modelIdToImageApiSlug(modelId: string): string {
  return modelId.replace(/\./g, '-')
}

const ALL_IMAGE_MODEL_IDS = [
  ...OPENAI_IMAGE_MODEL_IDS,
  ...GEMINI_IMAGE_MODEL_IDS,
] as const satisfies readonly StudioImageModelId[]

const ENDPOINTS: Record<StudioImageModelId, string> = Object.fromEntries(
  ALL_IMAGE_MODEL_IDS.map((id) => [id, `/api/image/${modelIdToImageApiSlug(id)}`]),
) as Record<StudioImageModelId, string>

export function postUrlForImageModel(model: string): string {
  const url = ENDPOINTS[model as StudioImageModelId]
  if (!url) {
    throw new Error(`No /api/image route registered for model "${model}".`)
  }
  return url
}
