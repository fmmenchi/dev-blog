import { Card, Link, Prose } from '@dev-blog/ui';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';

import { Avatar } from '../components/avatar';
import { SectionHeading } from '../components/section-heading';
import { profile } from '../lib/content';
import { renderMarkdown } from '../lib/markdown.server';
import { getPost, getPosts } from '../lib/posts.server';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';
import styles from './post.module.css';

export function loader({ params }: LoaderFunctionArgs) {
  const post = getPost(params['slug'] ?? '');
  if (!post) {
    throw new Response('Post not found', { status: 404 });
  }
  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const { html, toc } = renderMarkdown(post.body);
  return {
    post,
    html,
    toc,
    prev: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  };
}

export const meta = ({
  loaderData,
  matches,
  location,
}: {
  loaderData?: ReturnType<typeof loader>;
  matches: ({ id: string; loaderData?: unknown } | undefined)[];
  location: { pathname: string };
}) => {
  if (!loaderData) return [{ title: SITE_NAME }];
  const { post } = loaderData;
  return [
    ...seoMeta({
      origin: originFromMatches(matches),
      path: location.pathname,
      title: `${post.title} — ${SITE_NAME}`,
      description: post.excerpt,
      type: 'article',
    }),
    { property: 'article:published_time', content: post.date },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: { '@type': 'Person', name: profile.name },
      },
    },
  ];
};

export default function Post() {
  const { post, html, toc, prev, next } = useLoaderData<typeof loader>();

  return (
    <div className={styles['page']}>
      <article className={styles['article']}>
        <Link to="/blog" variant="plain" className={styles['back']}>
          ← /blog
        </Link>
        <div className={styles['meta']}>
          <span className={styles['metaDate']}>{post.date}</span>
          <span>{post.minutes} min read</span>
          <span>{post.tags.map((tag) => `#${tag}`).join(' ')}</span>
        </div>
        <h1 className={styles['title']}>{post.title}</h1>

        <Prose
          className={styles['body']}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <Card className={styles['author']}>
          <Avatar name={profile.name} size={52} />
          <div className={styles['authorText']}>
            <p className={styles['authorName']}>{profile.name}</p>
            <p className={styles['authorBio']}>{profile.bioCard}</p>
          </div>
        </Card>

        {/* The first post has no siblings: an empty nav landmark helps nobody. */}
        {prev || next ? (
          <nav aria-label="More articles" className={styles['siblings']}>
            {prev ? (
              <Link
                to={`/blog/${prev.slug}`}
                variant="plain"
                className={styles['sibling']}
              >
                <Card interactive className={styles['siblingCard']}>
                  <span className={styles['siblingLabel']}>← previous</span>
                  <span className={styles['siblingTitle']}>{prev.title}</span>
                </Card>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/blog/${next.slug}`}
                variant="plain"
                className={`${styles['sibling']} ${styles['siblingNext']}`}
              >
                <Card interactive className={styles['siblingCard']}>
                  <span className={styles['siblingLabel']}>next →</span>
                  <span className={styles['siblingTitle']}>{next.title}</span>
                </Card>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </article>

      <aside className={styles['sidebar']}>
        <SectionHeading>on this page</SectionHeading>
        <nav aria-label="On this page" className={styles['toc']}>
          {toc.map((entry, i) => (
            <Link
              key={entry.id}
              href={`#${entry.id}`}
              variant="plain"
              className={styles['tocLink']}
            >
              {String(i + 1).padStart(2, '0')} · {entry.text}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
