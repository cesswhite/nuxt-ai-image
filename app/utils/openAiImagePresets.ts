/** `gpt-image-2` — popular sizes per OpenAI image generation guide (developers.openai.com). */
export const GPT_IMAGE_2_SIZE_ITEMS: { label: string, value: string }[] = [
  { label: 'Auto', value: 'auto' },
  { label: '1:1 · 1024²', value: '1024x1024' },
  { label: 'Landscape · 1536×1024', value: '1536x1024' },
  { label: 'Portrait · 1024×1536', value: '1024x1536' },
  { label: '2K square · 2048²', value: '2048x2048' },
  { label: '2K landscape · 2048×1152', value: '2048x1152' },
  { label: '4K landscape · 3840×2160', value: '3840x2160' },
  { label: '4K portrait · 2160×3840', value: '2160x3840' },
]

export const GPT_IMAGE_2_SIZE_VALUES = new Set(GPT_IMAGE_2_SIZE_ITEMS.map((i) => i.value))

/** `gpt-image-1.5` — aspect presets map to standard GPT Image API sizes. */
export const GPT_IMAGE_15_ASPECT_ITEMS: { label: string, value: string }[] = [
  { label: '1:1 · 1024²', value: '1:1' },
  { label: '4:3 landscape · 1536×1024', value: '4:3' },
  { label: '16:9 · 1792×1024', value: '16:9' },
  { label: '9:16 · 1024×1792', value: '9:16' },
]

export type OpenAiImageQuality = 'low' | 'medium' | 'high' | 'auto'

export const OPENAI_QUALITY_ITEMS: { label: string, value: OpenAiImageQuality }[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Low (fast)', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

export function isGptImage2Model(model: string): boolean {
  return model.trim() === 'gpt-image-2'
}

export function isGptImage15Model(model: string): boolean {
  return model.trim() === 'gpt-image-1.5'
}
