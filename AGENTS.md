# AGENTS.md

Operating contract for AI coding agents. This file is the always-on hub: stack,
commands, the gates that must pass, and an index of topic rules. Open a
`.agent/*.md` spoke only when your task touches that topic.

## Project

Fabio's personal dev blog. A single React Router app backed by two small shared
libraries (design tokens + UI components).

- **Stack**: Nx monorepo (TS preset), pnpm, React 19, React Router **v8**
  (framework mode, SSR), Vite, Vitest + Testing Library, ESLint, Stylelint,
  Prettier.
- **No Tailwind**: styling is CSS Modules + design tokens (CSS custom
  properties) from `@dev-blog/theme`.

## Setup & commands

```bash
pnpm install                 # install (workspace: apps/* + libs/*)
pnpm nx dev blog             # dev server → http://localhost:4200
                             # (falls back to 4201 if 4200 is taken, e.g. by andes-routes)
pnpm nx run-many -t lint test build typecheck lint-css   # full verification
pnpm cz                      # guided conventional commit (commitizen)
```

## Definition of done — must be green before committing

```bash
pnpm nx format:check
pnpm nx run-many -t lint test build typecheck lint-css
```

Husky enforces two hooks: `pre-commit` runs `nx format:check --uncommitted`,
`commit-msg` runs commitlint (conventional commits — `nx release` derives
versions and changelogs from them).

## Conventions (essentials)

- **Commits**: conventional commits, enforced. Use `pnpm cz` when unsure.
  One commit per logical change — never batch unrelated changes together.
- **Branching**: trunk-based. Every change starts on a short-lived semantic
  branch off `main` (`feat/x`, `fix/y`, `docs/z`, `ci/w`) and merges fast.
  Never commit directly to `main`; every merge to `main` releases
  automatically (`nx release` in CI). Run the Definition-of-done gates
  before every commit.
- **Styling**: semantic design tokens only — any color/font value in a CSS
  Module must be a `var(--…)` token (Stylelint `declaration-strict-value`
  fails the build otherwise). See [design-system](./.agent/design-system.md).
- **Components**: reuse `@dev-blog/ui` before writing new markup; new
  components follow the one-folder-per-component pattern described in the
  design-system spoke.
- **Accessibility is a hard requirement**, not a nice-to-have: semantic HTML,
  accessible names, visible focus, reduced-motion support. Rules live in
  [design-system](./.agent/design-system.md).

## Structure

```
apps/
  blog/                # React Router v8 app (framework mode, SSR)
libs/
  theme/               # @dev-blog/theme — design tokens (CSS only)
  ui/                  # @dev-blog/ui — accessible React components
.agent/                # topic rules for agents (the "what to do")
doc/                   # human reference (the "why")
```

## Topic rules — read the spoke when your task touches it

| Spoke                                                  | Read it before…                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| [`.agent/architecture.md`](./.agent/architecture.md)   | adding routes/libs, changing deps, module boundaries, CI           |
| [`.agent/design-system.md`](./.agent/design-system.md) | styling, theming, authoring/changing a component, any UI/a11y work |

> `.agent/*` is documentation **for agents** (operational rules). `doc/*` is
> human reference (rationale, onboarding) — read it only for the "why", never
> as task instructions.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
