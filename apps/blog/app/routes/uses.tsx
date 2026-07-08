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
        <a href="https://uses.tech">
          uses.tech
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
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
                'Neovim — config lives in my dotfiles, every line has its why written next to it.',
            },
            { term: 'terminal', detail: 'Ghostty with tmux and zsh.' },
            { term: 'font', detail: 'JetBrains Mono, everywhere.' },
          ]}
        />
      </section>

      <section className={styles['section']} aria-label="Hardware">
        <div className={styles['sectionHeading']}>
          <SectionHeading>hardware</SectionHeading>
        </div>
        <Rows
          rows={[
            { term: 'machine', detail: 'MacBook Pro 14" (M3).' },
            { term: 'monitor', detail: 'One big 27" 4K display, no more.' },
            {
              term: 'keyboard',
              detail: 'A mechanical one that annoys everyone on calls.',
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
            { term: 'notes', detail: 'Plain Markdown files in a git repo.' },
            { term: 'passwords', detail: 'A password manager. Use one.' },
            {
              term: 'music',
              detail: 'Lo-fi playlists on repeat while writing.',
            },
          ]}
        />
      </section>
    </main>
  );
}
