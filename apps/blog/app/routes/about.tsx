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
          These days I build a product on mobile and web: the apps, the backend,
          and the Nx monorepo and release pipeline under all of it. A lot of
          that work, lately, is with AI. Before it, ten years on an enterprise
          supply-chain platform, where I built the frontend department from
          nothing: standards, design system, tooling, people. That is where I
          learned what conventions are worth.
        </p>
        <p className={styles['paragraph']}>
          I've come to believe that types and tests are what let you change your
          mind a year later, and that a release should be fast and automatic.
          But the only thing that really matters, to me, is the direction: get
          that right, and every change can be a small one.
        </p>
        <p className={styles['paragraph']}>
          This blog is my notebook. I write things down here to find out whether
          I actually understood them.
        </p>
      </main>
    </div>
  );
}
