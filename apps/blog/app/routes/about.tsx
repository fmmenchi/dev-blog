import { Button, Card, Link } from '@dev-blog/ui';

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
          <Link href="https://github.com/fmmenchi" variant="plain">
            github
          </Link>
          <Link href="https://x.com/fmmenchi" variant="plain">
            x
          </Link>
          <Link href="https://www.linkedin.com/in/fmmenchi" variant="plain">
            linkedin
          </Link>
        </nav>
      </aside>

      <main className={styles['main']}>
        <h1 className={styles['title']}>
          Hi, I'm <span className={styles['accent']}>{profile.name}</span>.
        </h1>
        <p className={styles['paragraph']}>
          Born in Arezzo, studied computer engineering in Bologna, and these
          days I write code from Cusco, in Peru. Thirteen years of it, almost
          all on the web. Ten of those went into an enterprise supply-chain
          platform, where I ended up building the frontend team from scratch.
          Now I'm on Wishew: a React Native app, a NestJS backend, some Go
          services, Google Cloud underneath. I work on the product, and on the
          monorepo and the release pipeline under it. Lately a good chunk of the
          week goes into AI.
        </p>
        <p className={styles['paragraph']}>
          This blog is my public notebook: I write to understand, not to teach.
          If a post happens to be useful to you, that's a welcome side effect.
        </p>
        <p className={styles['paragraph']}>
          I care about what keeps a codebase alive over time: conventions the
          whole team follows, types, tests, and a release that runs without a
          person. I also do a lot of code review and mentoring.
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
