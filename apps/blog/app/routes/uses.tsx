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
    title: `Uses — ${SITE_NAME}`,
    description: 'The tools I actually work with, updated occasionally.',
  });

interface Row {
  term: string;
  detail: string;
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

export default function Uses() {
  return (
    <main className={styles['page']}>
      <h1 className={styles['title']}>Uses</h1>
      <p className={styles['intro']}>
        The tools I actually work with, updated occasionally. Inspired by{' '}
        <Link href="https://uses.tech">uses.tech</Link>.
      </p>

      <section className={styles['section']} aria-label="Editor and terminal">
        <div className={styles['sectionHeading']}>
          <SectionHeading>editor &amp; terminal</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'editor',
              detail:
                'VS Code, with ESLint, Prettier, Nx Console, Git Graph — and Claude Code doing a good share of the typing.',
            },
            {
              term: 'terminal',
              detail:
                'The one macOS ships with, zsh and oh-my-zsh on top. I never got around to changing it.',
            },
            {
              term: 'font',
              detail: "The editor default. I've never felt the need to argue.",
            },
          ]}
        />
      </section>

      <section className={styles['section']} aria-label="Hardware">
        <div className={styles['sectionHeading']}>
          <SectionHeading>hardware</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'machine',
              detail: 'MacBook Pro 16" — Apple M5 Pro, 48 GB.',
            },
            {
              term: 'display',
              detail: 'The built-in Liquid Retina XDR. No second monitor.',
            },
            {
              term: 'keyboard',
              detail: "The laptop's own. It travels better than a mechanical.",
            },
          ]}
        />
      </section>

      <section className={styles['section']} aria-label="Toolchain">
        <div className={styles['sectionHeading']}>
          <SectionHeading>toolchain</SectionHeading>
        </div>
        <Rows
          rows={[
            { term: 'runtime', detail: 'Node 24 and pnpm, in Nx monorepos.' },
            {
              term: 'also on the machine',
              detail: 'Go, the JDK, Docker and Xcode — the work decides which.',
            },
            {
              term: 'cloud',
              detail: 'Google Cloud, driven with gcloud and Terraform.',
            },
          ]}
        />
      </section>

      <section className={styles['section']} aria-label="Apps and services">
        <div className={styles['sectionHeading']}>
          <SectionHeading>apps &amp; services</SectionHeading>
        </div>
        <Rows
          rows={[
            { term: 'notes', detail: 'Notion.' },
            {
              term: 'code hosting',
              detail: 'GitHub for mine, GitLab at work.',
            },
            { term: 'music', detail: 'Spotify, while writing.' },
          ]}
        />
      </section>
    </main>
  );
}
