# Design tokens — semantic reference

> Human reference (the "why + when"). The tokens themselves live in
> `libs/theme/src/styles/theme.css`, which is the source of truth: if this file
> and that one ever disagree, that one is right and this one is a bug.
> The operating rule for agents is in
> [`.agent/design-system.md`](../.agent/design-system.md).

## The rule

Every **colour** and every **typography** value a component uses comes from a
semantic role. The palette (`--color-neutral-*`) is off limits; hardcoded values
(`#333`, `13px`, a bare `1.6`) more so. A missing role is a signal to extend the
theme, not to inline a value. Stylelint fails the build on a hardcoded colour or
font — it cannot catch the rest, so the rest is on you.

The shared **scales** are a different matter, and components consume them
directly: spacing, type sizes, radius, weight, leading, motion. There is no
semantic role for "a radius" or "a font weight", and minting one per component
would be worse than the disease.

Three layers:

1. **Primitives** — the raw palette and those scales.
2. **Derived** — the three accent ramps. Written out by hand; nothing is
   computed.
3. **Semantic** — the roles. What you actually use.

## Colour

| Token                                                    | Use for                          |
| -------------------------------------------------------- | -------------------------------- |
| `--color-background` / `--color-foreground`              | page surface and default text    |
| `--color-card` / `--color-card-foreground`               | raised surfaces (post previews)  |
| `--color-muted` / `--color-muted-foreground`             | subdued fills and secondary text |
| `--color-border`                                         | hairlines and separators         |
| `--color-ring` / `--color-ring-offset`                   | the focus ring                   |
| `--color-primary` (+ `-foreground`, `-hover`, `-active`) | brand actions and links          |
| `--color-code-background` / `--color-code-foreground`    | code, inline and in blocks       |

Every `X` / `X-foreground` pair is chosen for WCAG AA contrast (≥ 4.5:1). Pair
them as designed and contrast follows; mix them by hand and it doesn't.

Surfaces get lighter as they rise: `background` → `card` → `muted`. Code goes the
other way — `--color-code-background` is the darkest thing on the page, which is
why code reads on a card as well as on the page.

Two of these have a history, and both were shipped broken:

- **`--color-muted` must never equal `--color-card`.** It did. A "subdued fill"
  identical to the surface beneath it is not subdued, it is invisible: inline
  `<code>` could not be seen on a post card at all.
- **`--color-ring` is deliberately not the accent.** A yellow focus ring
  vanishes the moment a focusable element sits on a yellow surface, and the home
  page has one. `--color-ring-offset` paints a dark gap beneath the ring so it
  survives any background.

## Theme and accent

There is **one theme, and it is dark.** No light theme, no `[data-theme]`
switch — do not add tokens "for the light theme".

What switches is the **accent**: `<html data-accent="yellow|lime|amber">`
(default yellow) redefines only the `--color-primary` family. Components never
know which accent is on, and must never write a per-accent style.

## Typography

Sizes: `--typography-h1-size`, `--typography-h2-size`, `--typography-h3-size`,
`--typography-body-size`, `--typography-small-size`, `--typography-mono-size`.

Headings: `--typography-heading-weight`, `--typography-heading-leading`,
`--typography-heading-tracking`.

Leading for text: `--typography-body-leading` (an article's body) and
`--typography-copy-leading` (excerpts, descriptions, card blurbs — tighter). The
second one exists because a literal `1.6` had been copied into ten files before
anyone gave it a name.

Families: `--font-sans` (Space Grotesk) and `--font-mono` (JetBrains Mono). The
app loads the webfonts; the theme only names them, with system fallbacks.

## Spacing & layout

Intent-based, T-shirt sized. Pick by **intent**, not by size:

- `--spacing-inset-{s,m,l}` — padding **inside** a container.
- `--spacing-stack-{s,m,l}` — vertical rhythm **between** stacked things.
- `--spacing-inline-{s,m}` — gaps between adjacent inline things.

Two widths, not interchangeable: `--layout-content-width` (70rem — the page
shell) and `--layout-prose-width` (42.5rem — the reading measure of an article's
body).

## Radius & motion

`--radius-{sm,md,lg,xl,full}`.

Two named transitions: `--transition-color` (hover fades) and
`--transition-lift` (the card that rises under the cursor). A global
`prefers-reduced-motion` rule neutralizes all motion — never gate meaning behind
it (WCAG 2.3.3).

## Choosing a token — quick heuristic

1. Text on the page? → `foreground` / `muted-foreground`.
2. Interactive, or a link? → the `primary` family.
3. A surface? → `background` → `card` → `muted`, in order of elevation.
4. Code? → the `code` pair, inline and block alike.
5. Nothing fits? → add a semantic role to the theme. Do not reach for the
   palette, and do not invent a token name without grepping the theme first: **an
   undefined `var()` silently deletes the whole declaration it sits in**, which
   is how a component shipped with no padding at all.
