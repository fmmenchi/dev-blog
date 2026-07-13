---
title: Four bugs that never failed
date: 2026-07-13
minutes: 6
tags: meta, tooling, post-mortem
excerpt: I rebuilt this site in the open. Four things broke, and not one of them failed — no error, no red test, nothing a review would have caught.
featured: true
---

I rebuilt this site in the open over the last few weeks. Four things were broken while I did it. What they have in common is more interesting than any of them: **none of them failed**. No error, no red test, no warning in the console. Every one of them shipped through a green build.

## What the site is

Enough context to follow the rest, and no more, because the stack is not the interesting part.

It's an Nx monorepo: one React Router app rendered on the server, running on Cloudflare Workers, plus two small libraries — the design tokens and the components. Tailwind is there, but over my own tokens: its palette and scales are wiped, so `bg-neutral-800` does not exist and cannot leak into a component by accident. Only semantic roles survive. Radix does anything that needs a keyboard.

That's it. Now the interesting part.

## 1. Two icons that were black on black

The GitHub and LinkedIn icons come from simple-icons, and they arrive like this:

```svg
<svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373…"/></svg>
```

Look at what isn't there: the path has no `fill`. And SVG's default fill is **black**.

My SVGR config had a rule to handle colour — it replaced `#000` with `currentColor`, so an icon would inherit the colour of the text around it. Sensible rule. It matched nothing, because there is no `#000` in the file. There is no colour in the file at all.

So two icons rendered black, on a near-black background. They were in the DOM. They had correct accessible names. They passed the accessibility sweep, which had no opinion about them, because an invisible icon is not an accessibility violation — it's just gone.

The fix went in the config, not in the SVGs. Those files are vendored: the next person to re-download one would have quietly undone a hand edit. A config that guesses at a string is a config that will guess wrong again.

## 2. A border nobody could see

The chips — the little skill labels — had gone strange. Not obviously wrong. Just... loose. Grey words sitting there.

The text was fine: 6.74:1 against the card, comfortably past AA. The **border** was 1.18:1.

That number is not a near miss. It's nothing. The chip had no shape; there was only text, and the outline I thought I was drawing was a colour indistinguishable from the surface behind it. I'd been looking straight at it for days.

Contrast is a number. When something looks off, measure it before you start moving things around.

## 3. The site was waiting for Google

I added Lighthouse to the repo, mostly to have a baseline. It said 71. First paint: 4.6 seconds. Total blocking time: **0 ms**.

Read those two together, because they're the whole story. Zero blocking time means the browser was doing nothing. No script to run, no work to do. It sat there for four and a half seconds — **waiting**.

Waiting for Google. The fonts came from Google Fonts, which is one line in the head and two round trips in reality: a render-blocking stylesheet from `fonts.googleapis.com`, which the browser has to fetch and parse before it even discovers that the actual font file lives on a _second_ origin, `fonts.gstatic.com`. Two DNS lookups, two TLS handshakes, two requests — all of it standing between the visitor and the first pixel.

The site wasn't slow. It was blocked, on someone else's infrastructure, for the privilege of a typeface.

There was a second bug hiding inside the first, and it was worse. The colophon of this site says _no analytics, no cookies, no tracking_. Meanwhile every visitor's IP address was handed to Google. Twice. In order to render the text making the promise.

The fonts are self-hosted now, which fixes both. `font-display: swap` means text paints immediately in a fallback rather than sitting invisible while a file downloads. But `swap` has a cost of its own: when the real font lands, the layout jumps, because the fallback has different metrics.

So the fallback lies. It's Arial, with its ascent, descent and width overridden so that it occupies **exactly** the space the real font is going to occupy. Text appears at once, the real face swaps in, and nothing moves. Layout shift went from 0.022 to zero.

## 4. The home page was downloading a dropdown it doesn't have

I added filters: tags on the posts, a sort order. The sort control is a Radix Select — the right call, because a hand-rolled dropdown is the single most reliable way to make a site unusable by keyboard.

Radix Select is also heavy. It brings a portal, a focus scope, and floating positioning: about 69 KiB, to do a job the browser has a native element for. Fine on the pages that use it.

Except every page was paying for it. The component library is imported by the root route, so its chunk is **shared** — and Radix Select was sitting in it. The home page, which has no dropdown, downloaded the dropdown.

React Router already code-splits by route. It could not help here: the cost was not in a route, it was in a chunk shared _between_ routes.

So I lazy-loaded the filter bar. It changed nothing. Same 102 KiB chunk, same Radix, same home page.

The reason took me an embarrassing amount of time. The library never declared `sideEffects` in its `package.json`. Without that declaration, a bundler has to assume that importing a module might _do something_ — register something, patch something, inject a stylesheet. So when the root route imports `Button` from the library's barrel file, and that barrel re-exports `Select`, the bundler cannot prove that dropping `Select` is safe. It keeps it. The lazy import was real, and completely pointless, because the module was already alive through the front door.

Declaring it is the whole fix — with one caveat that matters:

```json
"sideEffects": ["*.css"]
```

Not `false`. A CSS import genuinely **is** a side effect: importing it injects styles, and its exports are never used. Declaring `false` would have given the bundler permission to delete a stylesheet import as dead code, and the styles would have vanished — silently, which by now is the theme of this post.

Shared chunk: 102 KiB → 12 KiB. Radix stays exactly where it was.

## The thing they have in common

Not one of these failed.

The icon code was correct. The border was a valid colour, spelled correctly, resolving to a real token. The font link was an ordinary `<link>`, the kind that appears in every tutorial. The import was an ordinary import. Every test was green, and a reviewer reading the diff would have approved all four, because there is nothing in any of those diffs to object to.

They were invisible in precisely the way the bugs were.

So I stopped relying on being able to see them, and wrote things that can't help but notice:

- a check that fails the build on any `var(--token)` the theme doesn't define;
- a check that fails on any icon which hardcodes a colour, or never says what colour it is — the generated icon code is git-ignored, so _nobody was ever going to read it_;
- axe over every page, failing the build on a WCAG violation;
- Lighthouse over the production build, which is what caught the fonts.

The rule I'd write on the wall: **what nobody reviews needs a gate, not a reviewer.**

## Where it landed

Performance 71 → 82. First paint 4.6s → 3.5s. Layout shift to zero. Accessibility 100 on every page. Two icons you can now see.

It's still not fast enough. About 195 KiB of JavaScript ships for pages that are mostly text and barely need any. That's the next one.

Which is fine. The only thing that really matters is the direction — get that right, and every change can be a small one.
