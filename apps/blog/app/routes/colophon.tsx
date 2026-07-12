import { Link } from '@dev-blog/ui';

import { SectionHeading } from '../components/section-heading';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';

export const meta = ({
  matches,
  location,
}: {
  matches: ({ id: string; loaderData?: unknown } | undefined)[];
  location: { pathname: string };
}) =>
  seoMeta({
    origin: originFromMatches(matches),
    path: location.pathname,
    title: `Colophon — ${SITE_NAME}`,
    description: 'How this site is designed, built, tested and shipped.',
  });

interface Row {
  term: string;
  detail: React.ReactNode;
}

/**
 * Phone: the term sits on its own line above the detail. From `sm` the pair
 * becomes the two-column definition row of the desktop design.
 */
const ROW =
  'grid grid-cols-1 items-baseline gap-0.5 sm:grid-cols-[10rem_1fr] sm:gap-4';

function Rows({ rows }: { rows: Row[] }) {
  return (
    <dl className="flex flex-col gap-2">
      {rows.map(({ term, detail }) => (
        <div key={term} className={ROW}>
          <dt className="font-mono text-xs text-primary">{term}</dt>
          <dd className="text-sm leading-copy text-foreground">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Colophon() {
  return (
    <main className="mx-auto w-full max-w-[var(--layout-prose-width)] px-8 pt-14 pb-18">
      <h1 className="mb-3.5 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
        Colophon
      </h1>
      <p className="mb-10 text-base leading-copy text-muted-foreground">
        How this site is designed, built, tested and shipped.
      </p>

      <section className="mb-8" aria-label="Stack">
        <div className="mb-4">
          <SectionHeading>stack</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'framework',
              detail: 'React Router v8 in framework mode, server-rendered.',
            },
            { term: 'ui', detail: 'React 19 with TypeScript.' },
            {
              term: 'monorepo',
              detail:
                'Nx with pnpm workspaces: the app plus a design-token library and a component library.',
            },
            { term: 'bundler', detail: 'Vite.' },
          ]}
        />
      </section>

      <section className="mb-8" aria-label="Design">
        <div className="mb-4">
          <SectionHeading>design</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'design system',
              detail:
                'Hand-rolled: three layers of OKLCH design tokens (primitives, derived, semantic), dark-first.',
            },
            {
              term: 'accent',
              detail:
                'Switchable — yellow, lime or amber — from the header, remembered per visitor.',
            },
            {
              term: 'type',
              detail: 'Space Grotesk for text, JetBrains Mono for the rest.',
            },
            {
              term: 'styling',
              detail:
                'Tailwind v4 utilities bound to the semantic tokens; there is no palette to reach for.',
            },
          ]}
        />
      </section>

      <section className="mb-8" aria-label="Content">
        <div className="mb-4">
          <SectionHeading>content</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'posts',
              detail:
                'Markdown files with frontmatter, bundled at build time and rendered with marked.',
            },
            { term: 'feed', detail: 'Hand-built RSS 2.0 at /rss.xml.' },
          ]}
        />
      </section>

      <section className="mb-8" aria-label="Quality">
        <div className="mb-4">
          <SectionHeading>quality</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'tests',
              detail: 'Vitest and Testing Library, querying by role.',
            },
            {
              term: 'e2e',
              detail:
                'Playwright flows plus an axe WCAG A/AA sweep over every page.',
            },
            {
              term: 'releases',
              detail:
                'Conventional commits; every merge to main versions and releases automatically.',
            },
            {
              term: 'source',
              detail: (
                <Link href="https://github.com/fmmenchi/dev-blog">
                  github.com/fmmenchi/dev-blog
                </Link>
              ),
            },
          ]}
        />
      </section>

      <p className="rounded-e-lg border-s-[3px] border-primary bg-card px-6 py-4 text-sm text-muted-foreground">
        No analytics, no cookies, no tracking.
      </p>
    </main>
  );
}
