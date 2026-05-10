import type { Tool } from '@google/genai'
import type { Nanobanana2RequestOptions } from '~/utils/gemini31Nanobanana2'

/**
 * Grounding tools for `gemini-3.1-flash-image-preview` only (per Google image gen docs).
 */
export function buildGemini31SearchTools(
  opts: Nanobanana2RequestOptions | undefined,
): Tool[] | undefined {
  if (!opts) return undefined
  const web = Boolean(opts.grounding_web)
  const img = Boolean(opts.grounding_image_search)
  if (!web && !img) return undefined

  if (img && !web) {
    return [
      {
        googleSearch: {
          searchTypes: {
            imageSearch: {},
          },
        },
      },
    ]
  }
  if (web && !img) {
    return [{ googleSearch: {} }]
  }
  return [
    {
      googleSearch: {
        searchTypes: {
          webSearch: {},
          imageSearch: {},
        },
      },
    },
  ]
}
