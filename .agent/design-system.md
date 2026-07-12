# Styling & component authoring — agent rules

> Before any UI work, read the exports of `libs/ui/src/index.ts` and reuse what
> exists before writing new markup. The human "why" behind the token system is
> in [`doc/design-tokens.md`](../doc/design-tokens.md).

## Styling — tokens only

The token system in `libs/theme/src/styles/theme.css` has 3 levels
(primitives → derived → **semantic**).

- **Every colour and every typography value comes from a semantic role**:
  `var(--color-…)`, `var(--typography-…)`. Stylelint `declaration-strict-value`
  fails the build on a hardcoded colour or font (`transparent`, `currentColor`,
  `inherit` are allowed). If the role you need does not exist, **add it** — do
  not reach into the palette. `--color-neutral-*` is off limits in a component.
- **The shared scales are fair game**: `--space-*`, `--text-*`, `--radius-*`,
  `--font-weight-*`, `--leading-*`, `--font-sans/--font-mono`,
  `--duration-*`/`--ease-*`. There is no semantic role for radius, weight or
  font family, and inventing one per component would be worse. Prefer
  `--spacing-inset-*` / `--spacing-stack-*` / `--spacing-inline-*` where a
  semantic spacing role fits (inset = padding, stack = vertical rhythm,
  inline = horizontal gaps).
- **Never a bare number where a token exists.** A literal `line-height: 1.6`
  written in ten files is a missing token, not ten decisions. Stylelint does not
  catch these, so they are on you.
- **A `var()` that is not defined silently deletes its whole declaration.** It
  is invalid at computed-value time, so `padding: var(--nope) 1rem` renders as
  _no padding at all_, and nothing warns you. Grep the theme before you invent a
  token name.
- **There is one theme, and it is dark.** No light theme, no `[data-theme]`
  switch — do not add tokens "for the light theme", there isn't one. What _is_
  switchable is the accent: `<html data-accent="yellow|lime|amber">` remaps only
  the `--color-primary` family. Never write per-accent styles in a component.

## Component pattern

One folder per component under `libs/ui/src/components/<name>/`:

```
<name>/<name>.component.tsx   # typed props, native element semantics
<name>/<name>.module.css      # co-located, tokens only
<name>/<name>.spec.tsx        # Testing Library, query by role + accessible name
```

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
