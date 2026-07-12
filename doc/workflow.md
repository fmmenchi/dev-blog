# How work moves through this repo

The operational rules live in [`.agent/workflow.md`](../.agent/workflow.md) —
that file tells you _what_ to do. This one says _why_, so that the rules can be
argued with instead of merely obeyed.

## `main` is not a branch, it is the site

Every merge into `main` runs `nx release` and deploys. There is no staging
environment and no release train: the moment a pull request lands, the version
is cut, the changelog is written and the Worker is pushed to Cloudflare.

That single fact explains most of the rules below. `main` is not somewhere you
put work — it is where the work _is already live_.

## Branch from `main`, never from another branch

Trunk-based means short-lived branches off `main` and fast merges. The
temptation, when two changes look sequential, is to stack the second branch on
the first. Don't.

A stacked branch makes the merge **order** load-bearing: merge them out of
order, or merge only one, and you get a diff nobody wrote. It also makes the
second pull request unreviewable, because it shows the first one's commits too
until the first one lands.

If the second change genuinely cannot exist without the first, that is a sign it
is one change, not two.

## The gates do not run the e2e suite

`nx run-many -t lint test build typecheck lint-css` is fast, and it is what
Husky and habit push you to run. It does **not** run Playwright.

So the unit tests can be green while the site is broken: a deleted post, a
renamed route, a removed link — none of that shows up until the e2e suite runs,
and the e2e suite runs in CI. This has already cost us a red `main` and a
deploy that never happened.

If you touched a route, a link, a post, or markup: run `pnpm nx e2e blog-e2e`
before you push. (And note that inside a git worktree whose directory name
contains a slash, Playwright hangs and never runs at all — which is exactly how
you end up trusting green gates that tested nothing.)

## Merge commits, never squash

`nx release` reads the conventional commits that land on `main` to decide the
version bump and to write the changelog. Squashing a pull request collapses ten
meaningful commits into one, and the changelog loses everything the commits
said.

So: `gh pr merge <n> --merge`. If the branch has noisy commits, the answer is
not to squash at merge time — it is to write the branch's history properly
before opening the pull request.

## Wait for CI, then merge on purpose

A merge is a deploy. Merging a pull request whose CI is still running is the
same as deploying code you have not tested — and, once, is precisely how `main`
went red and stayed there while the site sat on the previous version.

Nothing merges itself here. Merging is a decision, and it belongs to the person,
not to the agent.

## Why the rules read like a list of scars

Because they are. Each one is here because it went wrong once: the stacked
branch, the skipped e2e run, the worktree that silently disabled Playwright, the
merge that beat its own CI. The rules are cheap. Re-learning them is not.
