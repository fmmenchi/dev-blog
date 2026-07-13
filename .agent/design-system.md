# Styling & component authoring — agent rules

> Before any UI work, read the exports of `libs/ui/src/index.ts` and reuse what
> exists before writing new markup. The human "why" behind the token system is
> in [`doc/design-tokens.md`](../doc/design-tokens.md).

## Styling — Tailwind over our tokens

`libs/theme/src/styles/theme.css` holds the values: **palette** (the complete
neutral ramp, plus one base colour per accent) → **derived** (the accent ramps,
computed from that base) → **semantic** (the roles, which hold no values of their
own). `tailwind.css` is the **bridge**: it wipes Tailwind's palette and scales and
re-adds ours.

**Tailwind obeys us, not the other way round.** Colours, type, radii, leading
_and_ spacing come from our tokens — the bridge points Tailwind's `--spacing` at
`--space-1`, so `p-4` is four of _our_ steps. Tailwind is the syntax, not the
source.

- **Only bridged roles have utilities**: `bg-card`, `text-muted-foreground`,
  `border-border`, `text-primary`, `rounded-xl`, `font-mono`, `leading-copy`…
  **The palette has no utilities** — `bg-neutral-800` does not exist, so it
  cannot leak into a component by accident. Semantic roles only.
- **A role missing from the bridge yields a class that does not compile** —
  silently unstyled, the same failure as an undefined `var()` wearing a new hat.
  Utility renders as nothing? Look in `tailwind.css` first.
- **Mobile first, and there is no alternative.** The variants are `min-width`:
  base = phone, `sm:` = 40rem, `md:` = 56rem. There is no `lg`, no `xl`, and no
  way to express `max-width`. If you find yourself wanting one, the base rules
  are wrong.
- **`text-*` also sets a line-height.** If the design calls for a specific one,
  say `leading-copy` / `leading-tight` explicitly or the type will drift.
- **Arbitrary values are a last resort**, for things that genuinely have no token
  (`[transition:var(--transition-lift)]`). A colour or a font size in brackets is
  a bug.
- **An arbitrary value that only wraps a token is a token missing from the
  bridge.** `max-w-[var(--layout-content-width)]` was copy-pasted into six files;
  it is now `max-w-content` (with `max-w-measure` for the reading column). If you
  are about to write `[var(--…)]`, bridge it instead.
- **Check the name is ours before you claim it.** Tailwind ships `max-w-prose`
  (65ch), so a `--container-prose` would not have overridden it — it would have
  collided, and the reading pages would silently have used Tailwind's width. Hence
  `measure`. Same story as the `neutral-*` palette we had to wipe.
- **CSS Modules survive in two places only** — `prose`, and the article body in
  `post` — because both style the descendants of Markdown rendered at runtime,
  which no class in a TSX file can reach.
- **One theme, and it is dark.** No light theme, no `[data-theme]`. The
  **accent** switches (`<html data-accent="yellow|lime|amber">`, the
  `--color-primary` family only) — the bridge points at the vars, so utilities
  follow it for free. Never write a per-accent style.

## Contrast is a number, not a taste

Check it before you ship a surface. `--color-border` measures **1.18:1** against a
card: correct for a rule between rows (felt, not seen), and useless as the edge of a
component — badges had an invisible outline and read as loose grey words.

- **`--color-border`** — separators. Not visible on its own, and that is the point.
- **`--color-border-strong`** — the edge of a component. Clears 3:1 (WCAG 1.4.11).

A chip is a SHAPE: give it a surface (`bg-muted`) and a `border-border-strong`. Text
on it still has to clear 4.5:1 (`text-muted-foreground` on `bg-muted` is 5.71:1).

## Radix, and making it free

Radix is the default for anything interactive: `Slot` (`asChild`), `Avatar`,
`ToggleGroup`, `Select`. Never hand-roll the roles, focus management or typeahead it
gives you — a hand-made dropdown is the commonest way a site becomes unusable by
keyboard.

**The cost is real, and it is a bundling problem, not a reason to avoid Radix.**
`libs/ui` is imported by `root.tsx`, so its chunk is SHARED and loads on every page.
Radix's Select alone (portal + focus scope + floating positioning) put ~69 KiB on the
home page, which has no dropdown. React Router's route splitting cannot help: the cost
sits in a chunk shared BETWEEN routes, not in a route.

Two things make it free, and **both are needed** — either alone does nothing:

1. **`"sideEffects"` in the lib's package.json.** Without it, a bundler must assume
   that importing a module might _do something_, so a barrel that re-exports everything
   keeps everything alive: `root.tsx` importing `Button` dragged `Select` in. It is set
   to `["*.css"]`, not `false`, because a CSS import genuinely IS a side effect —
   declaring `false` would let the bundler drop `import './prose.module.css'` and the
   styles would vanish silently.
2. **A dynamic import for the heavy component** (`filter-bar.lazy.tsx`), so it gets a
   chunk of its own and only the routes that show it pay.

Check the guard BEFORE the import: fetching a chunk to be told it renders nothing is
worse than not splitting at all.

## Component pattern

One folder per component under `libs/ui/src/components/<name>/`:

```
<name>/<name>.component.tsx   # typed props, native element semantics, Tailwind classes
<name>/<name>.spec.tsx        # Testing Library, query by role + accessible name
```

- **Variants are `cva`.** Export the `xxxVariants` function and its
  `VariantProps` type; merge with `cn()`. `button/` is the reference.
- **Use Radix.** Anything with behaviour (dialog, popover, tooltip, tabs, an
  `asChild` slot, an avatar's load states…) comes from `@radix-ui/*`. Do not
  hand-roll accessible behaviour a primitive already gets right. `Button` renders
  through Radix's `Slot` when `asChild` is set — that is how a `mailto:` stays an
  `<a>` while looking like a button.
- Export from `libs/ui/src/index.ts` (the only public entry).
- Prefer a small orthogonal prop API (`variant`, `as`) over boolean sprawl.
- A `.module.css` is the exception, not the rule — see the two survivors above.

## Accessibility (hard requirement)

Non-negotiable; tests must assert through the accessibility tree
(`getByRole` + accessible name, never `querySelector`):

- **Semantic HTML first**: native `button`/`a`/landmarks; `Container as="main"`
  for the single main landmark; heading levels never skip (WCAG 1.3.1).
- **Accessible names always**: icon-only controls require `aria-label`;
  decorative icons get `aria-hidden` (WCAG 4.1.2).
- **External links** open in a new tab with `rel="noopener noreferrer"` and the
  `sr-only` "(opens in a new tab)" hint — `Link` does this for you; never
  hand-roll `<a target="_blank">` (WCAG 2.4.4 / 3.2.5).
- **Internal links go through the router.** `<Link to="…">`, never a bare
  `<a href="/…">`, which full-reloads the document and throws away the SSR app's
  client-side navigation. The only exception is a resource route like
  `/rss.xml`, which must be a real document request.
- **Focus stays visible**: the global `:focus-visible` ring comes from the
  theme (WCAG 2.4.7) — never `outline: none` without a replacement.
- **Reduced motion**: the theme neutralizes animation under
  `prefers-reduced-motion` (WCAG 2.3.3) — never gate meaning behind motion.
- **Contrast**: semantic pairs (`--color-X` / `--color-X-foreground`) are
  chosen for WCAG AA (≥ 4.5:1) — pair them as designed and
  contrast follows.

## Adding a token

Add the primitive (if truly new) and the semantic role to `:root` in
`libs/theme/src/styles/theme.css` — there is only `:root`, there is no second
theme block to keep in step. Then run `pnpm nx run @dev-blog/theme:lint-css` and
update [`doc/design-tokens.md`](../doc/design-tokens.md) when the semantic
vocabulary changes.

**The palette is a scale, and a scale must be whole.** An unused step of the
neutral ramp is not dead weight — it is what makes `850` legible instead of
arbitrary. (This is the exception. A one-off `--typography-copy-leading` that
nothing consumes _is_ dead weight; a `--color-neutral-300` nobody has needed yet
is the scale.)

**Accents are derived, not authored.** One base colour each
(`--accent-yellow-base`); hover, active and foreground are computed from it with
OKLCH relative colours. Never hand-write an accent value — twelve literals is how
amber silently drifted away from the other two. A fourth accent is one line.

**Semantic roles hold no values.** They point at the palette:
`--color-card: var(--color-neutral-850)`. That indirection is what makes a theme
switch possible at all — re-point the roles, keep the palette. The accent switch
already works exactly this way.
