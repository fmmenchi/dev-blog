# Styling & component authoring — agent rules

> Before any UI work, read the exports of `libs/ui/src/index.ts` and reuse what
> exists before writing new markup. The human "why" behind the token system is
> in [`doc/design-tokens.md`](../doc/design-tokens.md).

## Styling — semantic tokens only (enforced)

The token system in `libs/theme/src/styles/theme.css` has 3 levels
(primitives → derived → **semantic**). Components consume **only the semantic
layer**. Violations fail the build:

- **Only semantic tokens**: `var(--color-…)`, `var(--typography-…)`,
  `var(--spacing-…)`, `var(--radius-…)`, `var(--transition-…)`.
- **Never primitives** (`--color-neutral-500`, `--space-4`, `--text-xl`) in
  component CSS — if a semantic role is missing, add it to the theme instead.
- **Never hardcode colors or fonts** in `*.module.css` — Stylelint
  `declaration-strict-value` fails the build (`transparent`, `currentColor`,
  `inherit` are allowed).
- Dark mode is automatic: semantic tokens flip under
  `<html data-theme="dark">`. Never write per-theme styles in components.

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
  `sr-only` "(si apre in una nuova scheda)" hint — `Link` does this for you;
  never hand-roll `<a target="_blank">` (WCAG 2.4.4 / 3.2.5).
- **Focus stays visible**: the global `:focus-visible` ring comes from the
  theme (WCAG 2.4.7) — never `outline: none` without a replacement.
- **Reduced motion**: the theme neutralizes animation under
  `prefers-reduced-motion` (WCAG 2.3.3) — never gate meaning behind motion.
- **Contrast**: semantic pairs (`--color-X` / `--color-X-foreground`) are
  chosen for WCAG AA (≥ 4.5:1) in both themes — pair them as designed and
  contrast follows.

## Adding a token

Add the primitive (if truly new) and the semantic role to **both** `:root` and
`[data-theme='dark']` in `libs/theme/src/styles/theme.css`, then run
`pnpm nx run @dev-blog/theme:lint-css`. Update
[`doc/design-tokens.md`](../doc/design-tokens.md) when the semantic vocabulary
changes.
