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

A **draft** (`content/drafts/`) is off that list by construction — `getPosts()` is the
one source the sitemap, the feed, the home and the index all read, and it never returns a
draft. So a draft is in no sitemap, no feed, no listing, and its page 404s in production;
it exists only on the dev server. Nothing to remember to exclude — publishing is moving
the file to `content/posts/`. See the README.

## Feeds and crawlers

- `/rss.xml`, `/sitemap.xml`, `/robots.txt` are **resource routes** — real
  document requests. Link them with a bare `<a>`, not the router `Link`. This is
  the one exception to the internal-links rule.
- `robots.txt` allows everything and points at the sitemap.

## The social card

`seoMeta` emits `og:image` (absolute — a crawler resolves no relative path) and
`twitter:card: summary_large_image`. The site once declared `summary` with **no image**,
which produces no card at all: every link shared to LinkedIn, Slack or WhatsApp arrived
as a grey line of text.

The PNGs are generated from the site's own tokens and fonts by `node tools/og-image.mjs`:
`apps/blog/public/og.png` for the site, and `apps/blog/public/og/<slug>.png` per post —
a post's card carries **its own title**, so a shared article previews as itself, not as
the site. `post.tsx` points `seoMeta`'s `image` at `/og/<slug>.png`.

The cards are committed. Regenerate and commit them when the palette, the name, the
tagline **or a post's title/slug** change — a card that drifts from what it advertises is
worse than no card. `tools/check-og.mjs` fails the build on a post with no card, or an
orphan card left by a rename.
