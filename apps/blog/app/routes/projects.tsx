import { Card, EmptyState, Link } from '@dev-blog/ui';

import { projects } from '../lib/content';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';
import styles from './projects.module.css';

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
    title: `Projects — ${SITE_NAME}`,
    description:
      'Things I build to understand how they work. Almost all open source, almost none finished.',
  });

/** Unlisted languages fall back to the muted dot. */
const LANGUAGE_COLOR: Record<string, string> = {
  TypeScript: 'oklch(70% 0.13 250)',
  Go: 'oklch(75% 0.15 130)',
};

export default function Projects() {
  return (
    <main className={styles['page']}>
      <h1 className={styles['title']}>Projects</h1>
      <p className={styles['intro']}>
        Things I build to understand how they work. Almost all open source,
        almost none finished.
      </p>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Nothing here I'd ask you to read. When there is, it lands here first."
        >
          <Link href="https://github.com/fmmenchi">github</Link>
        </EmptyState>
      ) : (
        <ul className={styles['grid']} aria-label="Projects">
          {projects.map((project) => (
            <li key={project.name}>
              <Link
                href={project.url}
                variant="plain"
                className={styles['cardLink']}
              >
                <Card as="article" interactive className={styles['card']}>
                  <div className={styles['cardHead']}>
                    <h2 className={styles['name']}>{project.name}</h2>
                    <span className={styles['period']}>
                      {project.period} · {project.status}
                    </span>
                  </div>
                  <p className={styles['description']}>{project.description}</p>
                  <div className={styles['cardFoot']}>
                    <span
                      aria-hidden="true"
                      className={styles['dot']}
                      style={{
                        background:
                          LANGUAGE_COLOR[project.language] ??
                          'var(--color-muted-foreground)',
                      }}
                    />
                    {project.language}
                    <span className={styles['repo']}>repo →</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
