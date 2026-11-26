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

## TypeScript 7 alongside 6

TypeScript 7 is the native compiler and ships **no programmatic API**; the tools
that `require('typescript')` still need 6. So the root `package.json` installs both
([Nx guide](https://nx.dev/docs/kb/typescript-7)):

```json
"@typescript/native": "npm:typescript@~7.0.2",
"typescript": "npm:@typescript/typescript6@~6.0.2"
```

- **On 7** — the `tsc` binary, so every `typecheck` task (`tsc --build
--emitDeclarationOnly`, inferred by `@nx/js/typescript`) and any `tsc` you run.
- **On 6** — everything that loads the API by the name `typescript`: the Nx
  project graph and the `@nx/js/typescript` plugin, typescript-eslint, `@svgr/*`,
  commitlint/commitizen config loading. `tsc6` is the 6.0 CLI, kept as the
  fallback. Vite does not use either (no dts plugin), no script of ours imports
  `typescript`, and no project uses the `@nx/js:tsc` executor.
- **Editor / MDX tooling** — `node_modules/typescript` is the 6.0 wrapper, which
  ships `lib/tsserverlibrary.js` but **not** `lib/tsserver.js`: an editor set to
  "workspace version" will not find it and falls back to its bundled TypeScript.
  The MDX language tooling may need 6 for the same reason.
- `@react-router/*` and `valibot` under `apps/blog` resolve their optional
  `typescript` peer to **7** (pnpm matches the real name of `@typescript/native`).
  Harmless today: neither loads the API at runtime. Re-check if one starts to.
- **Cache**: `targetDefaults.typecheck` adds both packages as
  `externalDependencies` (with `"..."` to keep the inferred inputs), so a compiler
  bump invalidates `typecheck`. Before this, no task hashed the compiler at all.

**Check what you are really running** — a stale `node_modules/.bin` can keep
running 6 without any error:

```bash
pnpm --dir <project> exec tsc --version    # 7.0.x
pnpm --dir <project> exec tsc6 --version   # 6.0.x
grep -o '"version":"[0-9.]*"' libs/ui/dist/tsconfig.lib.tsbuildinfo   # who wrote it
```

If `tsc` says 6, reinstall (`pnpm install`); if it still does, delete
`node_modules` and install clean.

**Remove the side-by-side** when typescript-eslint and Nx run on the TypeScript 7
API (or a 7.x ships one they support): drop `@typescript/native`, point
`typescript` back at `typescript@~7.x`, drop `@typescript/native` from
`targetDefaults.typecheck`, and delete this section.

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
  (`app/lib/maintenance.ts`) with Retry-After + noindex. KV writes take
  ~10–60s to reach every edge: after a toggle, wait and verify with curl
  before judging it broken. The production flag state is the author's
  intent — never flip it without being asked.
- The Cloudflare Vite plugin is skipped during Nx graph creation
  (`NX_GRAPH_CREATION`) and under Vitest — don't remove those guards.

## CI & release

- `.github/workflows/ci.yml` — the `main` job runs, as named steps:
  **Format check** → **lint / test / build / typecheck / lint-css** for every
  project (`nx run-many`) → **E2E** (Playwright flows + axe a11y sweep,
  driving the real worker in miniflare; chromium is installed in a prior
  step). Everything runs on PRs and on main; merging requires this job green
  (branch protection). On pushes to main two more jobs follow: `release`
  (tag + GitHub Release) and `deploy` (Cloudflare Workers).
- `nx release` versions from conventional commits (fixed versioning, `v{x}`
  tags, GitHub release changelog) — never hand-edit versions. Releases are
  **tag-only**: no release commits and no CHANGELOG.md land on main (the
  branch is protected — required green `main` check — and the bot cannot
  bypass it); the changelog lives in the GitHub Releases. The current
  version is always resolved from the latest `v*` tag, so the `version`
  fields in package.json files are historical, not authoritative.
