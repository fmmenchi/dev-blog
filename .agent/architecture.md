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

## Deployment

The app runs on **Cloudflare Workers** (SSR in workerd, client files as edge
static assets). Key pieces:

- `apps/blog/workers/app.ts` — worker entry (createRequestHandler).
- `apps/blog/app/entry.server.tsx` — web streams only
  (`renderToReadableStream`); never import Node APIs here.
- `apps/blog/wrangler.jsonc` — worker config (name `fabiomenchicchi-com`,
  custom domain `fabiomenchicchi.com`, `preview_urls` off).
- `pnpm nx run blog:preview` — runs the real worker locally in miniflare on
  port 4300 (what the e2e suite drives).
- `pnpm nx run blog:deploy` — wrangler deploy (CI does this on main; needs
  CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID secrets).
- **Maintenance mode**: the flag lives in **KV** (binding `MAINTENANCE_KV`,
  key `maintenance` = `on`), so deploys can never flip it — merging to main
  while the curtain is up keeps it up. Toggle instantly (no build, no
  redeploy) with `pnpm nx run blog:maintenance:on` / `blog:maintenance:off`
  (single target with Nx configurations, default `off`) or the "Maintenance"
  GitHub Actions workflow. The worker serves a 503 curtain
  (`app/lib/maintenance.ts`) with Retry-After + noindex.
- The Cloudflare Vite plugin is skipped during Nx graph creation
  (`NX_GRAPH_CREATION`) and under Vitest — don't remove those guards.

## CI & release

- `.github/workflows/ci.yml` (pnpm + Nx Cloud) runs format check, then
  `lint test build typecheck e2e`. `lint-css` runs Stylelint per lib.
- `nx release` versions from conventional commits (fixed versioning, `v{x}`
  tags, GitHub release changelog) — never hand-edit versions. Releases are
  **tag-only**: no release commits and no CHANGELOG.md land on main (the
  branch is protected — required green `main` check — and the bot cannot
  bypass it); the changelog lives in the GitHub Releases. The current
  version is always resolved from the latest `v*` tag, so the `version`
  fields in package.json files are historical, not authoritative.
