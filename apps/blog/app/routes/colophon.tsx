import { Container, Link } from '@dev-blog/ui';

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
    <Container as="main" width="measure" className="pt-14 pb-18">
      <h1 className="mb-3.5 text-display font-bold">Colophon</h1>
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
            {
              term: 'hosting',
              detail:
                'Cloudflare Workers. The pages are rendered at the edge, not on a server in one place.',
            },
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
                'Switchable — yellow, lime or amber — from the header. Your choice is kept in localStorage, and it is the only thing this site puts on your device.',
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
                'MDX, compiled at build time — so an article can use the same components as the rest of the site, and its images ship with a srcset like every other image here.',
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
                'Playwright flows, plus an axe sweep over every page: WCAG A/AA and the best-practice rules, which is where the landmark checks live.',
            },
            {
              term: 'security',
              detail:
                'A Content Security Policy with a fresh nonce on every response, and the usual headers. Dependencies are scanned with Trivy on every change and once a week.',
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

      {/*
        This paragraph has been wrong twice, in two different ways, and both are worth
        remembering.

        It first read "No analytics, no cookies, no tracking". The zone has Cloudflare Web
        Analytics switched on, so the edge injects a beacon into every response. Nobody
        wrote that script into this repo, which is exactly why nobody caught it in a diff.

        The correction then said "nothing kept on your device" — also false, and written
        without checking. The accent switcher puts your choice in localStorage. Worse, the
        comment in root.tsx admits it CHOSE localStorage over a cookie so that the old
        "no cookies" line would stay technically true. That is lawyering, not a promise.

        So this now says the two things that are actually kept, and names them. Measured on
        the live site: no cookies at all, one localStorage key (the accent), and a
        pageloadId that is a fresh UUID each load, so nothing joins two visits together.

        If you change what the site stores, this paragraph is the thing you change with it.
      */}
      <p className="rounded-e-lg border-s-[3px] border-primary bg-card px-6 py-4 text-sm text-muted-foreground">
        No cookies, and no consent banner to click away. One thing is kept on
        your device: the accent you picked. Cloudflare Web Analytics measures
        how fast this page loaded for you — anonymously, with a new id each
        load, and none that outlives it.
      </p>
    </Container>
  );
}
