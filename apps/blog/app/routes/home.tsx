import { Badge, Button, Card } from '@dev-blog/ui';
import { Link as RouterLink, useLoaderData } from 'react-router';

import { Avatar } from '../components/avatar';
import { SectionHeading } from '../components/section-heading';
import { profile } from '../lib/content';
import { getPosts } from '../lib/posts.server';
import styles from './home.module.css';

export function loader() {
  return { posts: getPosts() };
}

function compactDate(date: string) {
  return date.slice(5);
}

export default function Home() {
  const { posts } = useLoaderData<typeof loader>();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post !== featured);

  return (
    <main className={styles['page']}>
      <div className={styles['hero']}>
        <h1 className={styles['heroTitle']}>
          Software, sistemi e le{' '}
          <span className={styles['heroAccent']}>decisioni</span> dietro al
          codice.
        </h1>
        <p className={styles['heroTagline']}>
          Niente hype, niente thread-boy. Post-mortem onesti, architettura,
          TypeScript e developer experience.
        </p>
      </div>

      <div className={styles['grid']}>
        <aside className={styles['sidebar']}>
          <Card className={styles['profile']}>
            <Avatar name={profile.name} size={60} />
            <div>
              <p className={styles['profileName']}>{profile.name}</p>
              <p className={styles['profileBio']}>{profile.bioShort}</p>
            </div>
            <ul className={styles['skills']} aria-label="Competenze">
              {profile.skills.map((skill) => (
                <li key={skill}>
                  <Badge>{skill}</Badge>
                </li>
              ))}
            </ul>
            <Button>Newsletter</Button>
          </Card>

          <div className={styles['building']}>
            <p className={styles['buildingLabel']}>$ ORA IN BUILD</p>
            <p className={styles['buildingTitle']}>{profile.building}</p>
            <p
              className={styles['buildingProgress']}
              aria-label={`Avanzamento ${profile.buildingProgress}%`}
            >
              <span aria-hidden="true">
                [{'█'.repeat(profile.buildingProgress / 10)}
                {'░'.repeat(10 - profile.buildingProgress / 10)}]{' '}
                {profile.buildingProgress}%
              </span>
            </p>
          </div>

          <nav aria-label="Social" className={styles['social']}>
            <a href="https://github.com/fmmenchi">
              github
              <span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
            <a href="https://x.com/fmmenchi">
              x<span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
            <a href="mailto:f.menchicchi@gmail.com">mail</a>
          </nav>
        </aside>

        <section className={styles['list']} aria-label="Articoli">
          <SectionHeading aside={`${posts.length} post`}>
            articoli
          </SectionHeading>

          <RouterLink
            to={`/blog/${featured.slug}`}
            className={styles['cardLink']}
          >
            <Card as="article" interactive className={styles['featured']}>
              <div className={styles['featuredMeta']}>
                <span className={styles['featuredStar']}>★ ultimo</span>
                <span>
                  {featured.date} · {featured.minutes} min
                </span>
              </div>
              <h2 className={styles['featuredTitle']}>{featured.title}</h2>
              <p className={styles['featuredExcerpt']}>{featured.excerpt}</p>
              <div className={styles['tags']}>
                {featured.tags.map((tag) => (
                  <Badge key={tag} variant="tag">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </Card>
          </RouterLink>

          {rest.map((post) => (
            <RouterLink
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={styles['cardLink']}
            >
              <Card as="article" interactive className={styles['compact']}>
                <div>
                  <h2 className={styles['compactTitle']}>{post.title}</h2>
                  <p className={styles['compactExcerpt']}>{post.excerpt}</p>
                </div>
                <span className={styles['compactMeta']}>
                  {compactDate(post.date)} · {post.minutes} min
                </span>
              </Card>
            </RouterLink>
          ))}

          <RouterLink to="/" className={styles['all']}>
            → tutti gli articoli
          </RouterLink>
        </section>
      </div>
    </main>
  );
}
