# Gemini “Nano Banana” — expectations and prompting

**Nano Banana** is Google’s product name for **Gemini native image generation** (text-and-image in, image out via `generateContent` with image modalities). Official overview: [Gemini API — image generation](https://ai.google.dev/gemini-api/docs/image-generation).

**Not the same as vision:** analyzing or captioning **uploaded** images (output is **text/JSON**) is **[image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)** — see **[GEMINI_IMAGE_UNDERSTANDING.md](./GEMINI_IMAGE_UNDERSTANDING.md)**.

This template’s studio allowlist contains **exactly these three** API IDs (see `app/utils/studioImageModels.ts`): no other Gemini models are enabled for image generation here.

Each **`/api/image/*`** route implements **one model**. **Nanobanana 2** (`gemini-3.1-flash-image-preview`) follows Google’s sample setup (image search tool, high thinking, image-only modalities); the body is **`prompt`** plus optional **`aspect_ratio`** / **`image_size`** — see `docs/IMAGE_PIPELINE.md`. **Nanobanana Pro** can pass **Google Search grounding**, resolution, temperature, and related options; **Nanobanana** (**2.5 Flash Image**) can pass **system instructions**, temperature, and advanced generation params. There is still **no** multi-image upload or chat session in the stock routes.

---

## The three Nano Banana image models

| Product name (studio) | Model ID | Role |
|------------------------|----------|------|
| **Nanobanana 2** | `gemini-3.1-flash-image-preview` | **Default in this template** — Flash-speed + 3.1-class controls (full aspect list incl. Auto / **1:8** — see `app/utils/geminiAspectRatios.ts`). |
| **Nanobanana Pro** | `gemini-3-pro-image-preview` | **Pro assets** — **Auto** aspect + **1K/2K/4K** resolution, optional **system instructions**, Search grounding; UI in `geminiProNanobanana.ts` / studio. |
| **Nanobanana** | `gemini-2.5-flash-image` | Fast **Flash Image** — **Auto** aspect + Studio ratio list, optional **system instructions**, temperature / **Top P** / output length; **no** 1K–4K resolution control in API (aspect-only `imageConfig`). See `gemini25Nanobanana.ts`. |

Expect **both `TEXT` and `IMAGE` parts** in responses (the model may comment or label before the image). The template extracts the **last non-thought image** inline part for the preview.

---

## What Google expects you to use each model for

- **2.5 Flash Image** — Quick iterations, thumbnails, simple scenes; fewer input reference images (up to **3** in official limits for best results).
- **3 Pro Image Preview** — Branding, infographics, menus, packaging, **legible typography**, multi-step or layout-heavy prompts; **up to 4K**; Search grounding for **current facts** (weather, news, scores).
- **3.1 Flash Image Preview** — General **default** when you want Gemini 3.1-class behavior: speed + quality, **512** smallest tier (3.1 Flash only), broad **aspect ratio** set, **grounded** visuals when you wire Search tools.

For **Imagen-only** workflows (no Gemini multimodal), see [Imagen](https://ai.google.dev/gemini-api/docs/imagen) — not wired in this template.

---

## Prompting (best practices from Google)

1. **Describe the scene, not a tag list.** A short **narrative paragraph** beats comma-separated keywords: include subject, setting, light, mood, camera feel, and purpose (e.g. “hero for a skincare landing page”).
2. **Use domain language** — For photorealism: focal length, lighting (e.g. golden hour, softbox), angle (e.g. 45°, eye level). For products: “studio three-point light”, “polished concrete surface”.
3. **State intent** — “For an ecommerce square crop” or “minimal poster with room for headline” steers layout and negative space.
4. **Iterate in plain language** — “Warmer light, same composition” / “replace text with Spanish” matches how the **chat / multi-turn** API is designed (this repo’s single-shot route still benefits from the same style of clarity).
5. **Text inside the image** — Be explicit about **copy**, font style (descriptively), and hierarchy. **Pro** is strongest for professional typography; ask for text **clearly** and revise in follow-up turns when using a chat-based flow.
6. **Semantic positives over negatives** — Prefer “empty street at dawn, no people” over only “no cars”.
7. **Complex scenes** — Order steps: background → foreground → hero object → finishing detail.

---

## Technical expectations (parity with official behavior)

- **SynthID** — Generated images include Google’s [SynthID](https://ai.google.dev/responsible/docs/safeguards/synthid) watermarking (invisible metadata / safeguards per policy).
- **Thinking (Gemini 3 image family)** — “Thinking” can run **by default**; interim **thought** parts may appear; billing can include thinking-related usage. The client code treats `thought` parts as non-final when picking the output image.
- **Thought signatures** — Multi-turn flows should pass **thought signatures** back with history; high-level SDK **chat** helpers often handle this. Raw `generateContent` loops must follow [thought signatures](https://ai.google.dev/gemini-api/docs/thought-signatures) if you extend this app.
- **Resolution** — Gemini 3.x image models support **`imageSize`**: `512`, `1K`, `2K`, `4K` (uppercase **K** in API). **3.1 Flash Image** uniquely adds **512** (“0.5K”). This template currently sends **`1K`** for 3.x models in code; upgrade the handler + studio when you need **2K/4K/512**.
- **Aspect ratios** — **2.5 / 3 Pro Flash Image** share Studio ordering with **Auto** (omit `aspectRatio`) in `app/utils/geminiAspectRatios.ts`. **3.1 Flash Image Preview** adds extra ratios (**1:8**, **8:1**, **1:4**, **4:1**). The studio reads the same lists as the API.
- **Reference images** — Up to **14** total in advanced workflows (split between **object** vs **character** slots depending on model); **2.5** ~**3** inputs for best results. Not implemented in the stock **`/api/image/*`** routes.
- **Grounding** — **Google Search** / **Image Search** tools produce **real-time or fact-based** visuals (charts, weather). Requires `tools` in `generateContent` config and UI for attribution (see **Display requirements** for image search in Google’s doc). Not wired in the template.
- **Transparency** — Model does **not** support true **transparent PNG** as a guaranteed feature; ask for **solid / white** background when you need cutout-like assets.

---

## Limitations (short list)

- Best languages for prompting include **English** and others listed in Google’s doc (full list in official “Limitations” section).
- **No audio/video as generation input** for image generation mode.
- Output **count** may not match “give me exactly N images” every time.
- **Grounding with Search** + **people** from web image results: restrictions apply (**3.1 Flash Image** — see current Google notes on people in image search).
- **Batch** high-volume generation: use [Batch API](https://ai.google.dev/gemini-api/docs/batch-api) for scale (not in this template).

---

## References

- [Image generation (Nano Banana)](https://ai.google.dev/gemini-api/docs/image-generation) — full prompts, editing, grounding, resolution tables.
- [Gemini 3.1 Flash Image Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image-preview)
- [Gemini 3 Pro Image Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image-preview)
- [Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image)
- [Cookbook — Get Started Nano Banana](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_Started_Nano_Banana.ipynb)
