import { Button, Card, Link } from '@dev-blog/ui';

import { Avatar } from '../components/avatar';
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
          I grew up in Arezzo, studied computer engineering in Bologna, and now
          write code from Cusco, in the Peruvian Andes. Thirteen years in,
          almost all of them on the web.
        </p>
        <p className={styles['paragraph']}>
          Ten of those went into an enterprise supply-chain platform, where I
          built the frontend department from nothing: the standards, the design
          system, the tooling, the people. Now I'm at Wishew, on the product and
          on the machinery under it, the Nx monorepo and the release pipeline.
          Lately, a lot of that work is with AI.
        </p>
        <p className={styles['paragraph']}>
          That tension is the job, for me. My convictions are dull ones: a team
          moves at the speed of its conventions, types and tests are what let
          you change your mind a year later, a release should not need a person.
          What I enjoy is the opposite, taking apart something nobody has proven
          yet. The discipline is what makes the experiments affordable.
        </p>
        <p className={styles['paragraph']}>
          This blog is where the two meet. I write things down here to find out
          whether I actually understood them.
        </p>
      </main>
    </div>
  );
}
