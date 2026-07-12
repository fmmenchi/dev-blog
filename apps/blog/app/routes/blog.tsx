import { Badge, Card, EmptyState, Link } from '@dev-blog/ui';
import { useLoaderData } from 'react-router';

import { getPosts } from '../lib/posts.server';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';
import styles from './blog.module.css';

export function loader() {
  return { posts: getPosts() };
}

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
    title: `Blog — ${SITE_NAME}`,
    description: 'Every post, newest first.',
  });

export default function Blog() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <main className={styles['page']}>
      <h1 className={styles['title']}>Blog</h1>
      <p className={styles['intro']}>
        Everything I have written here, newest first.
      </p>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="The first one is being written. The feed is already live, if you'd rather be told than come back."
        />
      ) : (
        <ul className={styles['list']} aria-label="Posts">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                variant="plain"
                className={styles['cardLink']}
              >
                <Card as="article" interactive className={styles['card']}>
                  <div className={styles['meta']}>
                    <time dateTime={post.date}>{post.date}</time>
                    <span>{post.minutes} min</span>
                  </div>
                  <h2 className={styles['name']}>{post.title}</h2>
                  <p className={styles['excerpt']}>{post.excerpt}</p>
                  <div className={styles['tags']}>
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="tag">
                        #{tag}
                      </Badge>
                    ))}
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
