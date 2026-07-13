import { Badge, Card, EmptyState, Link } from '@dev-blog/ui';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';

import { FilterBar } from '../components/filter-bar';
import { byDate, facetsOf, matchesAny, readFilters } from '../lib/filters';
import { getPosts } from '../lib/posts.server';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';

export function loader({ request }: LoaderFunctionArgs) {
  const all = getPosts();
  /* The URL is the state: the server hands back the list already filtered, so
     the page never paints everything and then shrinks. */
  const { selected, sort } = readFilters(new URL(request.url), 'tag');

  return {
    posts: byDate(
      all.filter((post) => matchesAny(post.tags, selected)),
      sort,
    ),
    tags: facetsOf(all, (post) => post.tags),
    selected,
    sort,
    total: all.length,
  };
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
  const { posts, tags, selected, sort, total } = useLoaderData<typeof loader>();
  const filtered = selected.length > 0;

  return (
    <main className="mx-auto w-full max-w-content px-8 pt-14 pb-18">
      <h1 className="mb-3.5 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
        Blog
      </h1>
      <p className="mb-8 max-w-[35rem] text-base leading-copy text-muted-foreground">
        Everything I have written here.
      </p>

      <div className="mb-8">
        <FilterBar
          param="tag"
          label="Filter by tag"
          facets={tags}
          selected={selected}
          sort={sort}
          sortLabel="Sort posts"
          itemCount={total}
          prefix="#"
        />
        {/* Announced, not just shown: a filter that changes the list in silence
            is invisible to a screen reader (WCAG 4.1.3). */}
        <p role="status" aria-live="polite" className="sr-only">
          {filtered
            ? `${posts.length} of ${total} posts match the selected tags`
            : `${total} posts`}
        </p>
      </div>

      {posts.length === 0 ? (
        filtered ? (
          <EmptyState
            title="Nothing with those tags"
            description="No post carries the tags you picked. Unpick one and the list comes back."
          />
        ) : (
          <EmptyState
            title="No posts yet"
            description="The first one is being written. The feed is already live, if you'd rather be told than come back."
          />
        )
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
