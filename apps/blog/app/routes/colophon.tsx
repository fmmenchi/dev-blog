import { Link } from '@dev-blog/ui';

import { SectionHeading } from '../components/section-heading';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';
import styles from './info-page.module.css';

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

function Rows({ rows }: { rows: Row[] }) {
  return (
    <dl className={styles['rows']}>
      {rows.map(({ term, detail }) => (
        <div key={term} className={styles['row']}>
          <dt className={styles['term']}>{term}</dt>
          <dd className={styles['detail']}>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Colophon() {
  return (
    <main className={styles['page']}>
      <h1 className={styles['title']}>Colophon</h1>
      <p className={styles['intro']}>
        How this site is designed, built, tested and shipped.
      </p>

      <section className={styles['section']} aria-label="Stack">
        <div className={styles['sectionHeading']}>
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

      <section className={styles['section']} aria-label="Design">
        <div className={styles['sectionHeading']}>
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
                'CSS Modules consuming semantic tokens only; Stylelint fails the build on hardcoded values.',
            },
          ]}
        />
      </section>

      <section className={styles['section']} aria-label="Content">
        <div className={styles['sectionHeading']}>
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

      <section className={styles['section']} aria-label="Quality">
        <div className={styles['sectionHeading']}>
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

      <p className={styles['note']}>No analytics, no cookies, no tracking.</p>
    </main>
  );
}
