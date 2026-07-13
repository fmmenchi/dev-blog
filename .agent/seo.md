# SEO — agent rules

The "why" is in [`doc/seo.md`](../doc/seo.md). These are the rules.

## Every page

- **Export `meta` and build it with `seoMeta()`** (`app/lib/seo.ts`). It emits
  title, description, OpenGraph, Twitter card and the **canonical** link. Never
  hand-roll a `<meta>` or a canonical.
- **Take `origin` from `originFromMatches(matches)`**, never from the request
  host. The canonical must always be `https://fabiomenchicchi.com`, whatever
  host served the response — the Worker is also reachable on `*.workers.dev`,
  and a canonical that echoed the host would split the site in Google's index.
- Title: `<Page> — ${SITE_NAME}`. Description: one sentence, written for a human
  reading a search result, not for a crawler.
- Two routes deliberately have no `meta` and inherit the root's: `home` (it _is_
  the site) and `not-found`.

## New route

1. `meta` via `seoMeta()`.
2. Add its path to `staticPaths` in `app/routes/sitemap.ts` — **the sitemap does
   not discover routes**, it lists them by hand.
3. Add it to `PAGES` in `apps/blog-e2e/src/a11y.spec.ts`.

## Posts

`post.tsx` additionally emits `og:type: article`, `article:published_time` and a
**BlogPosting** JSON-LD block. A new post needs no code: the sitemap and the RSS
feed read the post list.

## Feeds and crawlers

- `/rss.xml`, `/sitemap.xml`, `/robots.txt` are **resource routes** — real
  document requests. Link them with a bare `<a>`, not the router `Link`. This is
  the one exception to the internal-links rule.
- `robots.txt` allows everything and points at the sitemap.

## Known gap

**There is no `og:image`.** Every link to this site previews as text on every
social platform and in every chat app. Fixing it means an image (static or
generated per post) plus `og:image` + `twitter:card: summary_large_image` in
`seoMeta`.

## The social card

`seoMeta` emits `og:image` (absolute — a crawler resolves no relative path) and
`twitter:card: summary_large_image`. The site once declared `summary` with **no image**,
which produces no card at all: every link shared to LinkedIn, Slack or WhatsApp arrived
as a grey line of text.

The PNG is `apps/blog/public/og.png`, generated from the site's own tokens and fonts by
`node tools/og-image.mjs`. Regenerate and commit it when the palette, the name or the
tagline change — a card that drifts from the site it advertises is worse than no card.
