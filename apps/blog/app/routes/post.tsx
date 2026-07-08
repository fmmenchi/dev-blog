import { Button, Card, Prose } from '@dev-blog/ui';
import {
  Link as RouterLink,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router';

import { Avatar } from '../components/avatar';
import { SectionHeading } from '../components/section-heading';
import { profile } from '../lib/content';
import { renderMarkdown } from '../lib/markdown.server';
import { getPost, getPosts } from '../lib/posts.server';
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

export const meta = ({ data }: { data?: ReturnType<typeof loader> }) => [
  { title: data ? `${data.post.title} — fabio.dev` : 'fabio.dev' },
  { name: 'description', content: data?.post.excerpt ?? '' },
];

export default function Post() {
  const { post, html, toc, prev, next } = useLoaderData<typeof loader>();

  return (
    <div className={styles['page']}>
      <article className={styles['article']}>
        <RouterLink to="/" className={styles['back']}>
          ← /blog
        </RouterLink>
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
          <Button>Newsletter</Button>
        </Card>

        <nav aria-label="More articles" className={styles['siblings']}>
          {prev ? (
            <RouterLink to={`/blog/${prev.slug}`} className={styles['sibling']}>
              <Card interactive className={styles['siblingCard']}>
                <span className={styles['siblingLabel']}>← previous</span>
                <span className={styles['siblingTitle']}>{prev.title}</span>
              </Card>
            </RouterLink>
          ) : (
            <span />
          )}
          {next ? (
            <RouterLink
              to={`/blog/${next.slug}`}
              className={`${styles['sibling']} ${styles['siblingNext']}`}
            >
              <Card interactive className={styles['siblingCard']}>
                <span className={styles['siblingLabel']}>next →</span>
                <span className={styles['siblingTitle']}>{next.title}</span>
              </Card>
            </RouterLink>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className={styles['sidebar']}>
        <SectionHeading>on this page</SectionHeading>
        <nav aria-label="On this page" className={styles['toc']}>
          {toc.map((entry, i) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className={styles['tocLink']}
            >
              {String(i + 1).padStart(2, '0')} · {entry.text}
            </a>
          ))}
        </nav>
        <a
          href={`https://x.com/intent/post?text=${encodeURIComponent(post.title)}`}
          className={styles['share']}
        >
          share ↗<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </aside>
    </div>
  );
}
