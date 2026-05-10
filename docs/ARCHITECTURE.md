# Architecture

For **why** these choices were made (Bun, demo mode, HTTP codes, route groups, docs split, etc.), see **[DECISIONS.md](./DECISIONS.md)**.

## Stack

- **Nuxt 4** — SSR, Nitro server routes, file-based routing.
- **Nuxt UI 4** — Forms, sidebar, cards, toasts; theming via `app.config.ts`.
- **Pinia** — `useStudioStore` holds prompt, provider, model, aspect ratio, last output, loading/error.
- **VueUse Motion** — Light entrance motion on landing and studio (transform + opacity on key elements).

## Request flow

1. User edits form in `app/pages/dashboard/(studio).vue`.
2. `useGenerateImage().generate()` POSTs to `/api/generate-image`.
3. `server/api/generate-image.post.ts` validates input:
   - If `runtimeConfig.public.imageGenDemo` is true → inline SVG data URL (no external I/O).
   - Else if keys missing for selected provider → 503.
   - Else if keys present but SDK not implemented → 501 (replace with your implementation).

## Forking to a new product

1. Copy the repo (or subtree) into a new folder.
2. Rename branding strings and `AppLogo` if needed.
3. Implement `generate-image.post.ts` using the same response shape: `{ output: string, provider, model, optional demo }`.
4. Add auth, rate limits, and credits when you move beyond a template.

## Security

- **Never** expose `OPENAI_API_KEY` or `GEMINI_API_KEY` to the client — they stay in `runtimeConfig` (server-only).
- Validate and size-limit prompts and any reference image payloads before calling vendors.
