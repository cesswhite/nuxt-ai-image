# Pricing — Nuxt AI Images (template)

This file is a **machine-readable reference** for AI agents. Replace branding and add your **product** tiers when you ship. For **Gemini API** costs, always confirm on [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

## Template

- **Product price:** Not applicable — this repo is a developer anchor template.
- **Inference:** You bill **Google Cloud / AI Studio** or **OpenAI** directly via API keys in `.env` — nothing is charged by this repository.

## Google Gemini — native image models used in this template

These are the **only** Gemini image model IDs wired in the studio (`app/utils/studioImageModels.ts`). Names match Google’s **Nano Banana** lineup in AI Studio:

| Studio label | Model ID | Notes |
|--------------|----------|--------|
| **Nanobanana 2** | `gemini-3.1-flash-image-preview` | Default in the template dropdown. |
| **Nanobanana Pro** | `gemini-3-pro-image-preview` | Heavier reasoning / asset quality. |
| **Nanobanana** | `gemini-2.5-flash-image` | Fast, efficient Flash Image. |

**Reference rates (verify on Google’s site — subject to change):** AI Studio often shows **text** (per 1M tokens) and **image output** (per image) separately. Example snapshot:

| Model | Text (input / output per 1M) | Image output (per image, indicative) |
|-------|------------------------------|--------------------------------------|
| `gemini-3.1-flash-image-preview` | $0.50 / $3.00 | ~$0.0672 |
| `gemini-3-pro-image-preview` | $2.00 / $12.00 | ~$0.134 |
| `gemini-2.5-flash-image` | $0.30 / $2.50 | ~$0.039 |

Use your Google Cloud billing reports and the official **pricing** page for invoices and current numbers.

## Production product (fork)

When you launch a paid product, add **your** plans here: currency, quotas, and feature bullets so assistants can compare you fairly.
