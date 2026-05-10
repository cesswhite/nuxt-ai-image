/**
 * **One POST route per image model** — slugs use hyphens instead of dots in model IDs.
 * Keep in sync with `server/api/image/*.post.ts` and `app/utils/studioImageModels.ts`.
 */
import { GEMINI_IMAGE_MODEL_IDS, OPENAI_IMAGE_MODEL_IDS } from '~/utils/studioImageModels'

const ENDPOINTS: Record<(typeof OPENAI_IMAGE_MODEL_IDS)[number] | (typeof GEMINI_IMAGE_MODEL_IDS)[number], string> = {
  'gpt-image-1.5': '/api/image/gpt-image-1-5',
  'gpt-image-2': '/api/image/gpt-image-2',
  'gemini-3.1-flash-image-preview': '/api/image/gemini-3-1-flash-image-preview',
  'gemini-3-pro-image-preview': '/api/image/gemini-3-pro-image-preview',
  'gemini-2.5-flash-image': '/api/image/gemini-2-5-flash-image',
}

export function postUrlForImageModel(model: string): string {
  const url = ENDPOINTS[model as keyof typeof ENDPOINTS]
  if (!url) {
    throw new Error(`No /api/image route registered for model "${model}".`)
  }
  return url
}
