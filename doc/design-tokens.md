# Design tokens — semantic reference

> Human reference (the "why + when"). The tokens live in
> `libs/theme/src/styles/theme.css`. The operating rule for agents is in
> [`.agent/design-system.md`](../.agent/design-system.md).

**The rule in one line:** consume the **semantic** layer only. Never palette
primitives (`--color-neutral-500`), never hardcoded values (`#333`, `13px`).
A missing role is a signal to extend the theme, not to inline a value.

There are three layers: **primitives** (raw palette/scales — implementation
detail) → **derived** (ramps computed from the brand base via OKLCH relative
colors) → **semantic** (what you use). This doc lists the semantic layer.

## Colour

| Token                                                    | Use for                          |
| -------------------------------------------------------- | -------------------------------- |
| `--color-background` / `--color-foreground`              | page surface and default text    |
| `--color-card` / `--color-card-foreground`               | raised surfaces (post previews)  |
| `--color-muted` / `--color-muted-foreground`             | subdued fills and secondary text |
| `--color-border`                                         | hairlines and separators         |
| `--color-ring`                                           | focus ring (accessibility)       |
| `--color-primary` (+ `-foreground`, `-hover`, `-active`) | brand actions and links          |
| `--color-accent` / `--color-accent-foreground`           | occasional highlights            |
| `--color-code-background` / `--color-code-foreground`    | inline code and code blocks      |

Every `X` / `X-foreground` pair is picked for WCAG AA contrast in both themes.
Dark mode redefines only this semantic layer under `[data-theme='dark']` —
components need no conditional styles.

## Typography

Role tokens: `--typography-h1/h2/h3-size`, `--typography-heading-weight`,
`--typography-heading-leading`, `--typography-body-size`,
`--typography-body-leading`, `--typography-small-size`; families `--font-sans`
and `--font-mono` (system stacks — the blog loads no webfonts).

## Spacing

Intent-based, T-shirt sized: `--spacing-stack-{s,m,l}` (vertical rhythm),
`--spacing-inline-{s,m}` (gaps between adjacent items),
`--spacing-inset-{s,m,l}` (container padding). Layout width:
`--layout-content-width` (42rem — comfortable reading measure).

## Radius & motion

`--radius-{sm,md,lg,full}`; `--transition-color` for hover/theme fades. A
global `prefers-reduced-motion` rule neutralizes all motion (WCAG 2.3.3).

## Choosing a token — quick heuristic

1. Is it text on the page? → `foreground` / `muted-foreground`.
2. Is it interactive or a link? → `primary` family.
3. Is it a surface? → `background` → `card` → `muted`, in order of elevation.
4. Nothing fits? Add a semantic role to the theme (both themes!) — do not
   reach for a primitive.
