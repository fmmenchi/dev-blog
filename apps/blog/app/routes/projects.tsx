import { Card } from '@dev-blog/ui';

import { projects } from '../lib/content';
import { originFromMatches, seoMeta } from '../lib/seo';
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
    title: 'Projects — fabio.dev',
    description:
      'Things I build to understand how they work. Almost all open source, almost none finished.',
  });

const LANGUAGE_COLOR: Record<string, string> = {
  Rust: 'oklch(60% 0.16 40)',
  Go: 'oklch(75% 0.15 130)',
  TypeScript: 'oklch(70% 0.13 250)',
  Lua: 'oklch(75% 0.12 145)',
};

export default function Projects() {
  return (
    <main className={styles['page']}>
      <h1 className={styles['title']}>Projects</h1>
      <p className={styles['intro']}>
        Things I build to understand how they work. Almost all open source,
        almost none finished.
      </p>

      <ul className={styles['grid']} aria-label="Projects">
        {projects.map((project) => (
          <li key={project.name}>
            <a href={project.url} className={styles['cardLink']}>
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
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
