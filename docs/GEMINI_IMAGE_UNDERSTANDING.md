# Gemini image understanding (vision)

**Image understanding** is **multimodal input → text (or structured) output**: captioning, visual Q&A, classification, comparison across images, and **object detection** with bounding boxes. It uses **general Gemini text / multimodal models** (for example `gemini-3-flash-preview`), not the **Nano Banana** native **image generation** models (`*-flash-image*`, `*-image-preview`).

Official guide: [Gemini API — image understanding](https://ai.google.dev/gemini-api/docs/image-understanding).

This template’s **`/api/image/*`** text-to-image routes are **prompt-only** for Google (no image upload). Use this document when you add **analyze image**, **compare two images**, or **detect objects** features with `generateContent` and **no** `responseModalities: IMAGE`.

**Related:** [GEMINI_NANO_BANANA.md](./GEMINI_NANO_BANANA.md) (generate and edit images).

---

## Capabilities (what to expect from the model)

- **General vision** — Describe scenes, answer questions, read charts/UI screenshots (quality varies by model and `media_resolution`).
- **Specialized training** — Google cites **improved accuracy** for tasks such as **[object detection](https://ai.google.dev/gemini-api/docs/image-understanding#object-detection)** (bounding boxes + JSON).
- **Replace narrow CV pipelines** — For many products, one multimodal Gemini call can replace separate captioning/classification models, subject to your latency and accuracy requirements.

---

## Passing images into `generateContent`

| Method | When to use |
|--------|----------------|
| **Inline** (`inlineData` / `Part.from_bytes`) | Smaller payloads; full request (prompt + all inline bytes + instructions) **≤ 20 MB**. Good for one-off API calls. |
| **[Files API](https://ai.google.dev/gemini-api/docs/files)** (upload → `file_uri` / `file_data`) | **Larger files**, or the **same image reused** across many requests (less duplication, often more efficient). |

You can **mix** File API references and inline parts in one request. You can also **fetch a URL**, read bytes, and pass them as inline data (your server must download and set correct `mime_type`).

---

## Multiple images in one prompt

Include **several image parts** in `contents` (any combination of uploaded files and inline images). Ask comparisons explicitly, e.g. “What is different between these two images?” Doc examples use **Python / JS / Go / REST** patterns for multi-image turns.

---

## Object detection and spatial JSON

The model can return **bounding boxes** when you prompt for detection and use structured output.

- **Normalized coordinates** — Boxes are often expressed as **`box_2d`**: **`[ymin, xmin, ymax, xmax]`** scaled to **`[0, 1000]`** relative to the image (see current doc for exact schema).
- **Map back to pixels** — Multiply by **height** for y indices and **width** for x indices after dividing by 1000, e.g. `abs_y1 = box_2d[0] / 1000 * height`, etc.

You can steer with instructions such as “all green objects”, “label with allergen types”, etc. **`response_mime_type: application/json`** is commonly used to parse machine-readable results.

Cookbook notebooks (linked from Google’s page):

- [2D spatial understanding](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Spatial_understanding.ipynb)
- [Experimental 3D pointing](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/examples/Spatial_understanding_3d.ipynb)

---

## Supported image MIME types

| Format | MIME type |
|--------|-----------|
| PNG | `image/png` |
| JPEG | `image/jpeg` |
| WEBP | `image/webp` |
| HEIC | `image/heic` |
| HEIF | `image/heif` |

See also: [File input methods](https://ai.google.dev/gemini-api/docs/file-input-methods).

---

## Limits and cost-related behavior

- **Files per request** — Up to **3,600** image files per request (official limit).
- **Vision tokenization (simplified)** — If **both** sides **≤ 384 px**, the image costs **258 tokens**. Larger images are split into **768×768** tiles; **each tile ≈ 258 tokens**. Rough tile count: compute a crop unit ≈ `floor(min(width, height) / 1.5)`, then multiply `ceil(width / unit) × ceil(height / unit)` (see official doc for the exact narrative and examples).
- **`media_resolution` (Gemini 3)** — Caps **max tokens per input image or video frame**; higher values help **fine text** and **small details** at the cost of **tokens, latency, and price**. See [media resolution](https://ai.google.dev/gemini-api/docs/media-resolution).

---

## Best practices (from Google)

1. **Orientation** — Ensure images are **correctly rotated** before encoding (EXIF vs normalized bitmap).
2. **Quality** — Prefer **sharp, well-lit** images for OCR and fine detail.
3. **Part order** — For a **single image + text**, put the **image part first** and the **text prompt after** in the `contents` / `parts` array.
4. **Safety** — Vision outputs can still be wrong or biased; apply **[safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance)** and human review where risk is high.

---

## Prompting patterns that work well

- **Be specific** — “List every readable price label in the image” beats “what’s in the image?” for UI screenshots.
- **Ask for structure** — Request **JSON** with a schema (field names, units) when you need stable parsing (detection, extraction).
- **Multi-image** — Name roles: “Image 1: before, Image 2: after — list visual differences in a table.”

---

## References

- [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Files API](https://ai.google.dev/gemini-api/docs/files)
- [System instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions)
- [File prompting strategies](https://ai.google.dev/gemini-api/docs/files#prompt-guide)
- [Safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance)
