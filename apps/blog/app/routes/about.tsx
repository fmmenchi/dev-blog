import { Button, Card } from '@dev-blog/ui';

import { Avatar } from '../components/avatar';
import { SectionHeading } from '../components/section-heading';
import { profile } from '../lib/content';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';
import styles from './about.module.css';

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
    title: `About — ${SITE_NAME}`,
    description: `${profile.name}, ${profile.role} — ${profile.bioCard}`,
  });

export default function About() {
  return (
    <div className={styles['page']}>
      <aside className={styles['sidebar']}>
        <Card className={styles['profile']}>
          <Avatar name={profile.name} size={72} />
          <div>
            <p className={styles['name']}>{profile.name}</p>
            <p className={styles['role']}>{profile.role}</p>
          </div>
          <div className={styles['facts']}>
            <span>{profile.location}</span>
            <span>{profile.experience}</span>
          </div>
          <Button>Say hi</Button>
        </Card>
        <nav aria-label="Social" className={styles['social']}>
          <a href="https://github.com/fmmenchi">
            github<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href="https://x.com/fmmenchi">
            x<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href="https://www.linkedin.com/in/fmmenchi">
            linkedin
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      </aside>

      <main className={styles['main']}>
        <h1 className={styles['title']}>
          Hi, I'm <span className={styles['accent']}>{profile.name}</span>.
        </h1>
        <p className={styles['paragraph']}>
          I've been building software for about ten years, almost always for the
          web: backend, frontend and everything in between. These days I work on
          distributed systems — queues, events, consistency — and on why most
          teams don't need them.
        </p>
        <p className={styles['paragraph']}>
          This blog is my public notebook: I write to understand, not to teach.
          If a post happens to be useful to you, that's a welcome side effect.
        </p>
        <p className={styles['paragraph']}>
          I believe in well-built monoliths, in types as documentation and in
          deleting code as an art form.
        </p>

        <div className={styles['now']}>
          <SectionHeading>now</SectionHeading>
        </div>
        <div className={styles['nowGrid']}>
          <div className={styles['nowBuild']}>
            <p className={styles['nowLabel']}>$ NOW BUILDING</p>
            <p className={styles['nowText']}>
              rss-gen — type-safe RSS feeds in Rust
            </p>
          </div>
          <Card className={styles['nowRead']}>
            <p className={`${styles['nowLabel']} ${styles['nowLabelAccent']}`}>
              $ NOW READING
            </p>
            <p className={styles['nowText']}>
              Designing Data-Intensive Applications (re-read)
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
