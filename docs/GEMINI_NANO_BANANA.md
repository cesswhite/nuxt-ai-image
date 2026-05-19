# Gemini “Nano Banana” — expectations and prompting

**Nano Banana** is Google’s product name for **Gemini native image generation** (text-and-image in, image out via `generateContent` with image modalities). Official overview: [Gemini API — image generation](https://ai.google.dev/gemini-api/docs/image-generation).

**Not the same as vision:** analyzing or captioning **uploaded** images (output is **text/JSON**) is **[image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)** — see **[GEMINI_IMAGE_UNDERSTANDING.md](./GEMINI_IMAGE_UNDERSTANDING.md)**.

The studio allowlist contains **exactly three** Gemini image API IDs (see **`app/utils/studioImageModels.ts`**). Each has a matching **`POST /api/image/*`** route and shared resolve helpers under **`app/utils/gemini*.ts`**.

---

## The three Nano Banana image models

| Product name (studio) | Model ID | Role |
|------------------------|----------|------|
| **Nanobanana 2** | `gemini-3.1-flash-image-preview` | **Default** — full AI Studio controls: output format, temperature, **512–4K**, aspect (incl. **1:8** / **8:1**), web + image search grounding, thinking level, stop sequences, Top P, max output tokens. |
| **Nanobanana Pro** | `gemini-3-pro-image-preview` | **Pro assets** — Auto aspect + **1K/2K/4K**, system instructions, Search grounding, temperature / Top P / output length. |
| **Nanobanana** | `gemini-2.5-flash-image` | Fast **Flash Image** — Auto aspect + standard ratio list, system instructions, temperature / Top P / output length; **no** 1K–4K `imageSize` in API. |

### How the template wires each model

| Model | Client body shape | Server |
|-------|-------------------|--------|
| **Nanobanana 2** | Flat fields on POST root (`output_format`, `image_size`, `grounding_*`, …) — built in **`useGenerateImage`** | `resolveNanobanana2Request(body)` → **`buildNanobanana2GeminiConfig()`** (`server/utils/geminiNanobanana2Config.ts`) |
| **Nanobanana Pro** | Nested `nanobanana_pro` | `resolveNanobananaProRequest()` + route config |
| **Nanobanana (2.5)** | Nested `nanobanana_25` | `resolveNanobanana25Request()` + route config |

Full field tables: **[IMAGE_PIPELINE.md](./IMAGE_PIPELINE.md)**.

### Response parts

By default Nanobanana 2 uses **`text_and_image`** modalities, so the API may return **both `TEXT` and `IMAGE` parts** (comments or labels before the image). Choose **`image_only`** in the studio to request **`IMAGE`** only. The server picks the **last non-thought** `inlineData` image for the preview (`server/utils/geminiImage.ts`).

There is **no** multi-image upload or chat session in the stock routes.

---

## What Google expects you to use each model for

- **2.5 Flash Image** — Quick iterations, thumbnails, simple scenes; fewer input reference images (up to **3** in official limits for best results).
- **3 Pro Image Preview** — Branding, infographics, menus, packaging, **legible typography**, multi-step or layout-heavy prompts; **up to 4K**; Search grounding for **current facts** (weather, news, scores).
- **3.1 Flash Image Preview** — General **default** when you want Gemini 3.1-class behavior: speed + quality, **512** smallest tier (3.1 Flash only), broad **aspect ratio** set, **grounded** visuals when Search / image search tools are enabled in the studio.

For **Imagen-only** workflows (no Gemini multimodal), see [Imagen](https://ai.google.dev/gemini-api/docs/imagen) — not wired in this template.

---

## Prompting (best practices from Google)

1. **Describe the scene, not a tag list.** A short **narrative paragraph** beats comma-separated keywords: subject, setting, light, mood, camera feel, purpose.
2. **Use domain language** — focal length, lighting (golden hour, softbox), angle; for products: “studio three-point light”, “polished concrete surface”.
3. **State intent** — “For an ecommerce square crop” or “minimal poster with room for headline”.
4. **Iterate in plain language** — matches multi-turn API design; single-shot routes still benefit from clarity.
5. **Text inside the image** — Be explicit about copy and hierarchy. **Pro** is strongest for typography.
6. **Semantic positives over negatives** — “empty street at dawn, no people” over only “no cars”.
7. **Complex scenes** — background → foreground → hero → finishing detail.

---

## Technical expectations (parity with official behavior)

- **SynthID** — Generated images include Google’s [SynthID](https://ai.google.dev/responsible/docs/safeguards/synthid) watermarking per policy.
- **Thinking (Gemini 3 image family)** — Interim **thought** parts may appear; billing can include thinking usage. The template skips `thought` parts when selecting the output image. Nanobanana 2 can set **`thinking_level`** (`minimal`–`high`) when not left at studio “default”.
- **Thought signatures** — Multi-turn flows should pass signatures back; see [thought signatures](https://ai.google.dev/gemini-api/docs/thought-signatures) if you add chat.
- **Resolution** — **`imageSize`**: `512`, `1K`, `2K`, `4K` (uppercase **K**). **512** is **3.1 Flash Image** only. The studio defaults to **`1K`**; Pro and 2.5 routes pass the studio value through **`buildGeminiImageConfig()`**.
- **Aspect ratios** — Lists and **Auto** (omit `aspectRatio` in API) live in **`app/utils/geminiImageUtils.ts`**. **3.1 Flash Image** adds **1:8**, **8:1**, **1:4**, **4:1** beyond the 2.5/Pro set.
- **Reference images** — Up to **14** in advanced Google workflows; **~3** recommended for 2.5. Not implemented in stock **`/api/image/*`** routes.
- **Grounding** — **Google Search** and **image search** tools are available for **Nanobanana 2** (studio toggles) and **Nanobanana Pro** (web search). Follow Google’s **display requirements** for search-grounded images.
- **Transparency** — True transparent PNG is not guaranteed; use solid backgrounds for cutout-like assets.

---

## Limitations (short list)

- Best prompting languages include **English** (see Google’s doc for the full list).
- **No audio/video** as generation input in image mode.
- Output **count** may not match “exactly N images” every time.
- **Grounding + people** from web image search: restrictions on **3.1 Flash Image** — check current Google notes.
- **Batch** at scale: [Batch API](https://ai.google.dev/gemini-api/docs/batch-api) — not in this template.

---

## References

- [Image generation (Nano Banana)](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini 3.1 Flash Image Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image-preview)
- [Gemini 3 Pro Image Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image-preview)
- [Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image)
- [Cookbook — Get Started Nano Banana](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_Started_Nano_Banana.ipynb)
