/**
 * Extract the last non-thought image from Gemini generateContent parts as a data URL.
 */
export function dataUrlFromGeminiParts(partsOut: unknown[] | undefined): string | null {
  if (!partsOut?.length) return null
  let lastImage: { data: string, mimeType: string } | null = null
  for (const part of partsOut) {
    const p = part as { thought?: boolean, inlineData?: { data?: string, mimeType?: string } }
    if (p.thought) continue
    if (p.inlineData?.data) {
      lastImage = {
        data: p.inlineData.data,
        mimeType: p.inlineData.mimeType || 'image/png',
      }
    }
  }
  if (!lastImage) {
    for (const part of partsOut) {
      const p = part as { inlineData?: { data?: string, mimeType?: string } }
      if (p.inlineData?.data) {
        lastImage = {
          data: p.inlineData.data,
          mimeType: p.inlineData.mimeType || 'image/png',
        }
      }
    }
  }
  if (!lastImage) return null
  return `data:${lastImage.mimeType};base64,${lastImage.data}`
}

export function geminiErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const anyE = e as Error & { status?: number }
    if (typeof anyE.status === 'number' && e.message) {
      return `${e.message} (HTTP ${anyE.status})`
    }
    return e.message
  }
  return 'Gemini image generation failed'
}
