# Styling & component authoring — agent rules

> Before any UI work, read the exports of `libs/ui/src/index.ts` and reuse what
> exists before writing new markup. The human "why" behind the token system is
> in [`doc/design-tokens.md`](../doc/design-tokens.md).

## Styling — Tailwind over our tokens

Values live in `libs/theme/src/styles/theme.css` (primitives → derived →
semantic). `libs/theme/src/styles/tailwind.css` is the **bridge**: it wipes
Tailwind's own palette and scales, then re-adds our semantic roles as utilities.

- **Only bridged roles have utilities**: `bg-card`, `text-muted-foreground`,
  `border-border`, `text-primary`, `rounded-xl`, `font-mono`, `leading-copy`…
  **There is no neutral palette** — `bg-neutral-800` does not exist, so the
  palette cannot leak into a component by accident.
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
  (`max-w-[42.5rem]`, `[transition:var(--transition-lift)]`). A colour or a font
  size in brackets is a bug.
- **CSS Modules survive in one place**: styling the descendants of rendered
  Markdown (`prose`). Utilities cannot reach children they do not render.
- **One theme, and it is dark.** No light theme, no `[data-theme]`. The
  **accent** switches (`<html data-accent="yellow|lime|amber">`, the
  `--color-primary` family only) — the bridge points at the vars, so utilities
  follow it for free. Never write a per-accent style.

## Component pattern

One folder per component under `libs/ui/src/components/<name>/`:

```
<name>/<name>.component.tsx   # typed props, native element semantics, Tailwind classes
<name>/<name>.spec.tsx        # Testing Library, query by role + accessible name
```

Classes live in the component as a `BASE` string plus a `VARIANT` record, merged
with the `cn()` helper — see `badge/` for the pattern. A `.module.css` file is
now the exception, not the rule: `prose/` has one because it styles the
descendants of rendered Markdown, which utilities cannot reach.

- Export from `libs/ui/src/index.ts` (the only public entry).
- Compose classes with the internal `cn` helper; accept and merge `className`.
- Prefer a small orthogonal prop API (`variant`, `as`) over boolean sprawl.
- `libs/ui/src/components/button/` and `link/` are the canonical examples —
  read one before authoring a new component.

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

A primitive with no semantic role consuming it is dead weight: either give it a
role or don't add it.
