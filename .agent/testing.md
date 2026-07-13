# Testing — agent rules

## The gates

```bash
pnpm nx format:check
pnpm nx run-many -t lint test build typecheck lint-css   # must be green before committing
pnpm nx e2e blog-e2e                                     # NOT in the gates — run it yourself
```

**The e2e suite is not in the definition of done.** CI runs it; if you skipped it,
`main` is where you find out. Run it whenever you touch routes, links, post content or
markup. Always with a timeout and closed stdin, or it hangs the session:

```bash
timeout -s KILL 600 pnpm nx e2e blog-e2e < /dev/null
```

Worktree names must not contain `/` — Playwright breaks on the path.

## Where a test belongs

Put a test where its subject actually lives. The rule that keeps this honest: **a test
must fail for the reason it is named after.**

| Kind                                     | Where                            | Why there                                                    |
| ---------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| A component's behaviour (state, ARIA)    | `*.spec.tsx` beside it           | Invent the data it needs. The real site is not a fixture.    |
| A route's contract (loader, empty state) | `apps/blog/tests/routes/`        | Asserts what the REAL content produces.                      |
| It must work without JavaScript          | `apps/blog-e2e/`                 | Only a browser can prove the server did the filtering.       |
| No WCAG A/AA violations                  | `apps/blog-e2e/src/a11y.spec.ts` | axe needs a rendered page.                                   |
| A score (perf, SEO)                      | `pnpm nx assess blog`            | Reports, does not gate. See [performance](./performance.md). |

Concretely: `FilterBar` is tested on invented facets in `filter-bar.spec.tsx`, because
the real blog has one post and the bar correctly refuses to render — a route test could
only ever assert its absence, and an e2e test would click a toolbar that is not there.
`projects.spec.tsx` asserts exactly that absence, which is the truth about the site.

## Accessibility is asserted, not reviewed

`a11y.spec.ts` runs axe over every page with `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`
and **fails the build on any violation**. Add a page to its list when you add a route,
and add a state (e.g. `/blog?tag=meta`) when a filter changes the DOM.

axe cannot see everything. It will not tell you that a border is invisible, that two
landmarks share a name, or that a control does nothing. Read
[design-system](./design-system.md) — accessibility is a hard requirement there.

## Generated code needs a gate, not a reviewer

`libs/icons/src` is generated and git-ignored: nobody will ever read it in a diff. Two
black-on-black icons shipped that way. So the guarantees are executable:

- `tools/check-tokens.mjs` — fails on any `var(--token)` the theme does not define.
- `tools/check-icons.mjs` — fails on an icon that hardcodes a colour or never sets
  `currentColor`.

When you add generated output, add its gate in the same commit.
