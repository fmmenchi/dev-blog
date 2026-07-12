import { Badge, Card, EmptyState, Link } from '@dev-blog/ui';
import { useLoaderData } from 'react-router';

import { getPosts } from '../lib/posts.server';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';

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
    <main className="mx-auto w-full max-w-[var(--layout-content-width)] px-8 pt-14 pb-18">
      <h1 className="mb-3.5 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
        Blog
      </h1>
      <p className="mb-10 max-w-[35rem] text-base leading-copy text-muted-foreground">
        Everything I have written here, newest first.
      </p>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="The first one is being written. The feed is already live, if you'd rather be told than come back."
        />
      ) : (
        <ul className="flex flex-col gap-4" aria-label="Posts">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                variant="plain"
                className="block text-inherit no-underline"
              >
                <Card as="article" interactive className="flex flex-col gap-2">
                  <div className="flex gap-4 font-mono text-xs text-muted-foreground">
                    <time dateTime={post.date}>{post.date}</time>
                    <span>{post.minutes} min</span>
                  </div>
                  <h2 className="text-lg leading-[1.3] font-semibold">
                    {post.title}
                  </h2>
                  <p className="leading-copy text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2">
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
