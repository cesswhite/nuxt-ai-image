/** Shared option lists for studio form `UDropdownMenu` fields (top P, max tokens). */

function trimDecimalLabel(v: number): string {
  return String(parseFloat(v.toFixed(2)))
}

/** 0 → 1 step 0.05 (top P). */
export const STUDIO_TOP_P_MENU_ITEMS: { label: string, value: number }[] = (() => {
  const out: { label: string, value: number }[] = []
  for (let i = 0; i <= 20; i++) {
    const v = Math.round(i * 5) / 100
    out.push({ label: trimDecimalLabel(v), value: v })
  }
  return out
})()

/** Common max-output token caps. */
export const STUDIO_MAX_OUTPUT_TOKEN_MENU_ITEMS: { label: string, value: number }[] = [
  256, 512, 1024, 2048, 4096, 8192, 16_384, 32_768, 65_536,
].map((v) => ({ label: v.toLocaleString('en-US'), value: v }))
