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
          Born in Arezzo, computer engineering in Bologna, now writing code from
          Cusco, Peru. Thirteen years of software, nearly all of it for the web.
          Before this I spent a decade on an enterprise supply-chain platform,
          where I built a frontend department from nothing. These days I work on
          Wishew: a React Native app, a NestJS backend, a handful of Go services
          and the cloud they run on — plus the usual hours on the parts nobody
          demos, the monorepo, the design system, the pipeline that ships it.
          Lately, on teaching an LLM to find its way around all of that.
        </p>
        <p className={styles['paragraph']}>
          This blog is my public notebook: I write to understand, not to teach.
          If a post happens to be useful to you, that's a welcome side effect.
        </p>
        <p className={styles['paragraph']}>
          What I actually care about is the boring half — conventions a team can
          follow, types that save a comment, tests that catch what I forgot, a
          release that runs itself. And reviewing other people's code, which is
          still the fastest way I know to learn something.
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
