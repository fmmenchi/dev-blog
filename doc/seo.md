# SEO — what a crawler sees, and why

> Human reference. The operating rules are in
> [`.agent/seo.md`](../.agent/seo.md).

The blog is server-rendered, so there is no "SEO layer" bolted on: what a crawler
gets is what a reader gets, in the first response. That is most of the work
already done. What remains is being deliberate about four things — identity,
discovery, meaning, and the previews.

## Identity: one canonical origin, always

`seoMeta()` builds every page's canonical link from the origin the **root loader**
provides, not from the host the request arrived on. That is not paranoia.

The Worker is configured with `workers_dev: true`, so the same site is also
reachable at `fabiomenchicchi-com.<subdomain>.workers.dev`. If the canonical
echoed the request host, Google would see two complete copies of the blog and
have to guess which one is real — and it would split the ranking of every page
between them. Pinning the canonical to `https://fabiomenchicchi.com` means the
duplicate origin points at the original and quietly stops competing with it.

The same helper also emits the OpenGraph and Twitter tags, so a page cannot end
up with a title in the tab and a different one in a shared link. There is one
place to change, and it changes everywhere.

## Discovery: the sitemap does not discover anything

`/sitemap.xml` is built from a **hand-written list** of static paths plus the
post list. Posts take care of themselves — add a Markdown file and it appears in
the sitemap and in the feed. **Pages do not.** A new route that nobody adds to
`staticPaths` is invisible to a crawler that does not stumble into a link to it.

This is a deliberate trade — the alternative is introspecting the route manifest,
which costs more than it saves for a site with seven pages — but it is a trap,
and it is why the rule exists.

`/robots.txt` allows everything and points at the sitemap. There is nothing here
worth hiding from a crawler.

## Meaning: posts say what they are

An article emits `og:type: article`, an `article:published_time`, and a
**BlogPosting** JSON-LD block naming the headline, the date and the author. That
is what lets a search engine show a date under the result instead of guessing at
one, and what lets an aggregator treat the page as a post rather than as a page.

Everything else on the site is a `website`, honestly. The `/uses` page is not an
article and does not pretend to be one.

## The previews

Every link used to preview as a bare rectangle of text: there was no `og:image`, and
`twitter:card` was `summary`, which without an image shows no card at all.

Now `tools/og-image.mjs` renders a 1200×630 card from the site's own tokens and fonts —
one for the site (`public/og.png`) and one per post (`public/og/<slug>.png`), carrying the
post's title. They are committed, not rendered at request time, and `tools/check-og.mjs`
fails the build if a post is missing its card or a rename leaves an orphan. Regenerate
with `node tools/og-image.mjs` when the palette, the name, the tagline or a title changes.

## What is deliberately not here

- **No analytics, no tracking.** The colophon says so, and it is true. This costs
  nothing in ranking and buys the reader something.
- **No keyword tuning.** Descriptions are written for a person reading a search
  result. If that also pleases a crawler, good.
- **No AMP, no prerender tricks, no schema soup.** The site is 200 KB of
  server-rendered HTML. That was the whole point.
