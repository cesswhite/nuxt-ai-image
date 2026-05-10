# AI SEO and discoverability

This template includes **`public/llms.txt`** and **`public/pricing.md`** so AI systems and agents can read a short product summary and pricing shape without executing your SPA.

## On-page content

- Landing `pages/(home).vue` uses `useSeoMeta` with a clear description and optional `ogUrl` from `NUXT_PUBLIC_SITE_URL`.
- Studio and settings each set a **unique title and description**.

## Extractable structure

When you write marketing pages in a fork:

- Lead with a **definition** in the first paragraph.
- Use **H2/H3** headings that match natural queries.
- Add **FAQ** sections for buyer questions; consider FAQ schema later (`seo` module or manual JSON-LD).

## Robots / AI crawlers

Decide policy explicitly:

- Allow **GPTBot**, **ChatGPT-User**, **PerplexityBot**, **Google-Extended**, etc. if you want citations.
- Blocking training crawlers vs search/citation bots is a product decision — document it in your deployed `robots.txt` when you add one.

## Statistics and authority

For real launch content: cite sources, add numbers with dates, show **last updated** on key pages — these patterns improve extractability in AI answers (see Princeton-style GEO guidance in your workspace `ai-seo` skill).

## Machine-readable pricing

Replace `public/pricing.md` with real tiers so LLM shopping agents can parse plans without scraping JS-only UI.
