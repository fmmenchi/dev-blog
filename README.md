# dev-blog

The source of [fabiomenchicchi.com](https://fabiomenchicchi.com) — my personal
blog. Honest notes on architecture, tooling and developer experience.

It is a small Nx monorepo: one React Router app, and the two libraries it is
built out of.

## Run it

```sh
pnpm install
pnpm nx dev blog        # → http://localhost:4200
```

## Structure

```
apps/
  blog/        the site — React Router v8 (framework mode, SSR)
  blog-e2e/    Playwright flows + an axe accessibility sweep over every page
libs/
  theme/       @dev-blog/theme — design tokens, CSS only
  ui/          @dev-blog/ui — accessible React components
```

Posts are Markdown with frontmatter under `apps/blog/content/posts/`, bundled at
build time. The feed is hand-built at `/rss.xml`.

## How it is built

**Tailwind, but over my own tokens.** The token system comes first — OKLCH
primitives → derived → semantic roles — and a `@theme inline` bridge is what
turns those roles into utilities. Tailwind's own palette and scales are wiped,
so `bg-card` exists and `bg-neutral-800` does not: the design system cannot leak.
The theme is dark, the accent is switchable at runtime, and components never
know which accent is on.

Mobile-first is not a convention here. Tailwind's variants are `min-width`, and
the two breakpoints are the only ones defined, so a desktop-first layout is not
something you have to be disciplined about — it is something you cannot write.

**Accessibility is a build gate, not a review comment.** Semantic HTML, an
accessible name on every control, visible focus, reduced-motion support. Unit
tests query through the accessibility tree — by role and accessible name, never
by CSS selector — and the e2e suite runs axe (WCAG A/AA) across every page.

**One way to do each thing.** `Link` is the only way to link: it handles router
navigation, external targets and `mailto:` alike. `Button` is the only way to
make a button. Reuse before writing new markup.

## Verify

```sh
pnpm nx format:check
pnpm nx run-many -t lint test build typecheck lint-css
```

Both must be green before a commit. CI runs the same two, plus the e2e suite
against a real worker in miniflare.

## Ship

The app runs on Cloudflare Workers.

```sh
pnpm nx deploy blog          # wrangler deploy
pnpm nx maintenance blog     # flip the maintenance flag in KV
```

Commits are [conventional](https://www.conventionalcommits.org) and enforced by
commitlint — `pnpm cz` if you want a prompt. Every merge into `main` releases:
`nx release` derives the version and the changelog from those commits, which is
why pull requests land as **merge commits**, never squashed or rebased.

## For agents

The operating contract lives in [`AGENTS.md`](./AGENTS.md), with topic rules in
[`.agent/`](./.agent). `CLAUDE.md` only imports it, so every agent reads the
same source. The human-facing rationale — the "why" behind the tokens and the
architecture — is in [`doc/`](./doc).
