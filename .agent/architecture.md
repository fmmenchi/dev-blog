# Architecture — agent rules

> Hub: [`AGENTS.md`](../AGENTS.md). Human rationale for the token system lives
> in [`doc/design-tokens.md`](../doc/design-tokens.md).

## Topology

One app, two libs, dependencies flow strictly downward:

```
blog (apps/blog)  →  @dev-blog/ui (libs/ui)  →  @dev-blog/theme (libs/theme)
                  →  @dev-blog/theme
```

- **`apps/blog`** — React Router **v8 framework mode** (SSR). Routes are
  registered in `apps/blog/app/routes.tsx`; route modules live in
  `apps/blog/app/routes/`. `root.tsx` owns the document shell and loads the
  theme stylesheet via `@dev-blog/theme/styles/theme.css?url`.
- **`libs/ui`** — source-only React components (no build step: the app's
  bundler compiles `src` directly). Exports through `src/index.ts` only.
- **`libs/theme`** — CSS-only design tokens, exported as
  `@dev-blog/theme/styles/*`. Its TS entry point is intentionally empty.

## Module boundaries (enforced by ESLint)

Tags in each project's `package.json` `nx.tags`; constraints in the root
`eslint.config.mjs`:

- `type:theme` is a leaf — depends on nothing.
- `type:ui` may depend only on `type:ui` and `type:theme` — never on app code.
- `type:app` may depend on anything; `scope:shared` only on `scope:shared`.

When you add a lib, tag it and extend the constraints — do not add an untagged
project.

## React Router v8 notes

- Runtime and dev packages are pinned together at `^8.1.0` (root and app must
  stay on the same major).
- `AppLoadContext` no longer exists; `entry.server.tsx` types its params via
  `Parameters<HandleDocumentRequestFunction>`.

## CI & release

- `.github/workflows/ci.yml` (pnpm + Nx Cloud) runs format check, then
  `lint test build typecheck e2e`. `lint-css` runs Stylelint per lib.
- `nx release` versions from conventional commits (fixed versioning, `v{x}`
  tags, GitHub release changelog) — never hand-edit versions.
