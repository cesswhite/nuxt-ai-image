/** Parse a `data:image/...;base64,...` URL for download / API reference parts. */
export function parseImageDataUrl(dataUrl: string): { mimeType: string, data: string } | null {
  const trimmed = dataUrl.trim()
  const match = /^data:([^;,]+);base64,([\s\S]+)$/i.exec(trimmed)
  if (!match?.[1] || !match[2]) return null
  return { mimeType: match[1], data: match[2].replace(/\s/g, '') }
}

export function downloadFilenameForDataUrl(dataUrl: string, base = 'generated-image'): string {
  const parsed = parseImageDataUrl(dataUrl)
  if (!parsed) return `${base}.png`
  const ext = parsed.mimeType.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'png'
  return `${base}.${ext}`
}

/** Trigger a file download in the browser from a data URL or remote URL. */
export function downloadImageFromUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
