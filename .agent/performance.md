# Performance — agent rules

Read this before touching fonts, `root.tsx` links, or anything that loads from
a domain we do not own.

## Measure with `assess`, never by eye

```bash
pnpm nx assess blog        # builds, serves on :4300 (miniflare), sweeps with unlighthouse
```

It scores the **production** build on the runtime Cloudflare actually runs. A
Lighthouse number taken from `nx dev` measures a site nobody visits. The report
lands in `.unlighthouse/` (git-ignored); `ci-result.json` has the scores per route.

It **reports**, it does not gate — unlike axe (see [testing](./testing.md)). Run it
after any change to the critical path, and quote the before/after. "Feels faster" is
not a result.

## Read the metrics before you fix anything

The metric tells you _which_ problem you have. Fixing the wrong one costs a day:

- **high FCP + TBT near zero** → you are not executing too much, you are **waiting**.
  Look at the critical path: render-blocking resources, third-party origins, TTFB.
- **high TBT** → JavaScript. Look at bundle size and hydration.
- **CLS above ~0.01** → something resizes after paint. Usually a font swap or an
  image with no intrinsic size.

The blog once scored 71 with a total blocking time of **0 ms**. It was not slow. It
was waiting for Google Fonts.

## No third-party origins in the critical path

Every new origin costs DNS + TLS + a round trip **before the first pixel**, and on a
phone that is seconds, not milliseconds. Google Fonts cost two: the stylesheet on
`fonts.googleapis.com`, then the woff2 on `fonts.gstatic.com`, the second only
discovered after the first was parsed.

Self-host instead. It is also the only way `/colophon`'s "no analytics, no cookies,
no tracking" stays true — a font request hands the visitor's IP to a third party.

## Fonts

Self-hosted, committed under `apps/blog/public/fonts` so their URLs are stable and
cacheable rather than content-hashed on every build. `@font-face` lives in
`libs/theme/src/styles/fonts.css`.

- **`font-display: swap`** — text paints immediately in a fallback. Never let text be
  invisible while a font downloads.
- **Metric-adjusted fallbacks are mandatory.** `swap` alone shifts the layout when the
  real font lands. The `… Fallback` faces are Arial with `size-adjust`,
  `ascent-override` and `descent-override` set so it occupies exactly the space the
  real font will. CLS went 0.022 → 0.000.
  Regenerate with `node tools/font-metrics.mjs` when a font changes. **Never hand-tune
  the numbers** — they are computed from the font files.
- **Preload the fonts that paint the first screen, and only those.** A preload is a
  high-priority fetch: preloading the mono face too cost 0.3s of LCP by competing with
  the stylesheet for bandwidth. Preloading everything preloads nothing.
- `crossOrigin: 'anonymous'` on a font preload **even same-origin**, or the file is
  fetched twice.

## Known gap

~195 KiB of JavaScript ships unused on first paint (React + Router hydration). It does
not block — TBT is 0 — but it is the next thing worth attacking.
