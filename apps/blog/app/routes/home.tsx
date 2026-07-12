import { Badge, Card, EmptyState, Link } from '@dev-blog/ui';
import { useLoaderData } from 'react-router';

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

/** The home is a shop window, not the archive: featured post plus this many. */
const COMPACT_POSTS = 4;

export default function Home() {
  const { posts } = useLoaderData<typeof loader>();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts
    .filter((post) => post !== featured)
    .slice(0, COMPACT_POSTS);
  const hasMore = posts.length > rest.length + 1;

  return (
    <main className={styles['page']}>
      <div className={styles['hero']}>
        <h1 className={styles['heroTitle']}>
          Software, systems and the{' '}
          <span className={styles['heroAccent']}>decisions</span> behind the
          code.
        </h1>
        <p className={styles['heroTagline']}>
          Honest notes on architecture, tooling and developer experience.
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
            <ul className={styles['skills']} aria-label="Skills">
              {profile.skills.map((skill) => (
                <li key={skill}>
                  <Badge>{skill}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <div className={styles['building']}>
            <p className={styles['buildingLabel']}>$ NOW BUILDING</p>
            <p className={styles['buildingTitle']}>{profile.building}</p>
            <p className={styles['buildingProgress']}>
              <span aria-hidden="true">
                [{'█'.repeat(profile.buildingProgress / 10)}
                {'░'.repeat(10 - profile.buildingProgress / 10)}]{' '}
                {profile.buildingProgress}%
              </span>
              <span className="sr-only">
                Progress {profile.buildingProgress}%
              </span>
            </p>
          </div>
        </aside>

        <section className={styles['list']} aria-label="Articles">
          <SectionHeading aside={`${posts.length} posts`}>
            articles
          </SectionHeading>

          {featured === undefined ? (
            <EmptyState
              title="No posts yet"
              description="The first one is being written. The feed is already live, if you'd rather be told than come back."
            />
          ) : (
            <>
              <Link
                to={`/blog/${featured.slug}`}
                variant="plain"
                className={styles['cardLink']}
              >
                <Card as="article" interactive className={styles['featured']}>
                  <div className={styles['featuredMeta']}>
                    <span className={styles['featuredStar']}>★ latest</span>
                    <span>
                      {featured.date} · {featured.minutes} min
                    </span>
                  </div>
                  <h2 className={styles['featuredTitle']}>{featured.title}</h2>
                  <p className={styles['featuredExcerpt']}>
                    {featured.excerpt}
                  </p>
                  <div className={styles['tags']}>
                    {featured.tags.map((tag) => (
                      <Badge key={tag} variant="tag">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Link>

              {rest.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  variant="plain"
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
                </Link>
              ))}

              {hasMore ? (
                <Link to="/blog" variant="plain" className={styles['all']}>
                  → all articles
                </Link>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
