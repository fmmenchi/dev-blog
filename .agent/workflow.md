# Workflow — agent rules

Trunk-based. `main` is not a branch, it is the site: every merge into it runs
`nx release` and deploys. The reasoning behind each rule below — and the
incident that produced it — is in [`doc/workflow.md`](../doc/workflow.md).

## Branch

- **Always branch from `origin/main`.** Never stack a branch on another branch,
  even when the work looks sequential — stacked PRs make the merge order load
  bearing and are how `main` gets broken.
- Semantic name: `<type>/<desc>` — `feat/`, `fix/`, `docs/`, `ci/`.
- One branch, one PR, one idea.

## Worktree

- Work in an isolated worktree under `.claude/worktrees/`, one per PR, branched
  from `origin/main`. Never the shared checkout.
- **The worktree dir name must not contain `/`** — a slash hangs Playwright and
  the e2e suite will not run.
- Remove it once the PR is merged (`git worktree remove`).

## Verify (before every commit)

```bash
pnpm nx format:check
pnpm nx run-many -t lint test build typecheck lint-css
```

- **The e2e suite is NOT in those gates.** Run `pnpm nx e2e blog-e2e` yourself
  whenever you touch routes, links, post content, or markup. CI runs it; if you
  skipped it, CI is where you find out — and `main` is where it hurts.
- Stylelint guards colours and fonts only. It will not catch a literal
  `line-height`, and it will not catch an **undefined `var()`**, which silently
  deletes its whole declaration.

## Commit

- Conventional commits, enforced by commitlint. `pnpm cz` if unsure.
- Type must be one of: `build chore ci docs feat fix perf refactor revert style test`.
  There is no `content`.
- **Subject must be lower-case** — `fix(ui): the empty state…`, not
  `fix(ui): EmptyState…`.
- One commit per logical change. Never `git add -A` blindly: it will sweep up a
  subagent's half-written files.

## Merge

- **Only on the user's explicit command.** A merge releases and deploys.
- **Wait for CI to be green.** Merging a red PR turns `main` red and blocks the
  deploy, which has already happened once.
- `gh pr merge <n> --merge` — **always a merge commit**. Never squash, never
  rebase: `nx release` derives the version and the changelog from the individual
  conventional commits that land on `main`.
- Never push to `main` directly. Never force-push without being asked.

When the release job cuts a new tag it also posts to Slack, in tested TypeScript
(`@dev-blog/release`'s `notify` executor over `@dev-blog/notify`) — never `curl`, because
Slack answers `200` while refusing a bad message and only a unit test catches that. The
step reads its secrets from the environment and skips (green) when they are absent, so a
fork does not go red over a notification it was never set up to send. A **local** `nx
release` does NOT notify or deploy — only the CI release job does.
