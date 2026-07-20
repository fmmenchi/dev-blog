import { Avatar, Card, Container, Link, Prose, ShareBar } from '@dev-blog/ui';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';

import { TableOfContents } from '../components/table-of-contents';
import { mdxComponents } from '../components/mdx';
import { profile } from '../lib/content';
import { avatarSrc } from '../lib/avatar-image';
import { getPost, getPosts } from '../lib/posts.server';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME, SITE_URL } from '../lib/site';
import styles from './post.module.css';

export function loader({ params }: LoaderFunctionArgs) {
  const post = getPost(params['slug'] ?? '');
  if (!post) {
    throw new Response('Post not found', { status: 404 });
  }
  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);

  return {
    post,
    prev: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  };
}

/*
 * The post's CONTENT is a component, so it cannot travel through the loader — loader data
 * is JSON. It is imported with the route instead.
 *
 * EAGERLY, and that was measured, not assumed. Lazy-loading it split each article into its
 * own chunk, which sounds strictly better — until you throttle the network. The Suspense
 * boundary then falls back during hydration, the article BLANKS OUT and comes back, and
 * layout shift went from 0 to 0.108. A chunk boundary is not worth a page that jumps
 * under the reader.
 *
 * The cost is that this route carries every post. At a handful of articles that is a few
 * KB; when it stops being, the answer is to render the body without hydrating it, not to
 * put the split back.
 */
const contents = import.meta.glob('../../content/posts/*.mdx', {
  eager: true,
  import: 'default',
}) as Record<string, React.ComponentType<{ components?: unknown }>>;

/* Draft bodies, on the dev server only. `MODE === 'development'` and not `DEV`, so the
   glob is dead code under both the production build and Vitest — see posts.server.ts for
   why. No draft component reaches the bundle. */
const draftContents =
  import.meta.env.MODE === 'development'
    ? (import.meta.glob('../../content/drafts/*.mdx', {
        eager: true,
        import: 'default',
      }) as Record<string, React.ComponentType<{ components?: unknown }>>)
    : {};

const CONTENT = Object.fromEntries(
  Object.entries({ ...contents, ...draftContents }).map(([path, Component]) => [
    path.replace(/^.*\//, '').replace(/\.mdx$/, ''),
    Component,
  ]),
);

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
      /* Its own card, carrying its own title — see tools/og-image.mjs. */
      image: `/og/${post.slug}.png`,
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

/** `group` so the card title can react to a hover anywhere on the sibling. */
const SIBLING = 'group block text-inherit no-underline';
const SIBLING_CARD = 'flex h-full flex-col gap-1.5 px-5 py-4';
const SIBLING_LABEL = 'font-mono text-[10.5px] text-muted-foreground';
const SIBLING_TITLE =
  'text-[14.5px] leading-[1.35] font-semibold [transition:var(--transition-color)] group-hover:text-primary';

export default function Post() {
  const { post, prev, next } = useLoaderData<typeof loader>();
  const Content = CONTENT[post.slug];
  const { toc } = post;

  return (
    // Phone: one column. From `md` the table of contents becomes a right rail.
    /* `main`, like every other route. The post was the ONE page without the landmark,
       so a screen-reader user navigating by landmarks had no way into the article — and
       the axe sweep never said a word, because `landmark-one-main` is a best-practice
       rule and the sweep only asked for WCAG A/AA. It asks for both now. */
    <Container
      as="main"
      className="grid grid-cols-1 items-start gap-12 pt-10 pb-18 md:grid-cols-[1fr_260px]"
    >
      <article className="min-w-0 max-w-measure">
        <Link
          to="/blog"
          variant="plain"
          className="font-mono text-xs text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary"
        >
          ← /blog
        </Link>
        <div className="mt-6.5 mb-3.5 flex flex-wrap gap-3.5 font-mono text-2xs text-muted-foreground">
          <span className="text-primary">{post.date}</span>
          <span>{post.minutes} min read</span>
          <span>{post.tags.map((tag) => `#${tag}`).join(' ')}</span>
        </div>
        <h1 className="mb-5 text-3xl leading-tight font-bold tracking-heading">
          {post.title}
        </h1>

        {/*
         * The article, as COMPONENTS. `mdxComponents` is what lets a post contain an
         * <Image> with a srcset, and what turns its internal links into router links
         * instead of full page reloads.
         *
         * `body` stays a CSS Module because it styles the elements MDX emits (p, code,
         * blockquote…), which no class in this file can reach.
         */}
        <Prose className={styles['body']}>
          <Content components={mdxComponents} />
        </Prose>

        {/* At the END: the moment sharing becomes a thing anyone wants to do is the
            moment they have finished reading. The url is the CANONICAL one, never the
            host the page happens to be served from — nobody wants a localhost link. */}
        <ShareBar
          url={`${SITE_URL}/blog/${post.slug}`}
          title={post.title}
          className="mt-10"
        />

        <Card className="mt-7 flex items-center gap-4">
          <Avatar name={profile.name} src={avatarSrc} size={64} />
          <div className="flex-1">
            <p className="text-base font-bold">{profile.name}</p>
            <p className="text-[13px] leading-normal text-muted-foreground">
              {profile.bioCard}
            </p>
          </div>
        </Card>

        {/* The first post has no siblings: an empty nav landmark helps nobody. */}
        {prev || next ? (
          <nav
            aria-label="More posts"
            className="mt-4 grid grid-cols-2 gap-3.5"
          >
            {prev ? (
              <Link
                to={`/blog/${prev.slug}`}
                variant="plain"
                className={SIBLING}
              >
                <Card interactive className={SIBLING_CARD}>
                  <span className={SIBLING_LABEL}>← previous</span>
                  <span className={SIBLING_TITLE}>{prev.title}</span>
                </Card>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/blog/${next.slug}`}
                variant="plain"
                className={SIBLING}
              >
                <Card interactive className={`${SIBLING_CARD} text-right`}>
                  <span className={SIBLING_LABEL}>next →</span>
                  <span className={SIBLING_TITLE}>{next.title}</span>
                </Card>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </article>

      {/* Phone: the contents come first. From `md` they become a sticky rail. */}
      <aside className="-order-1 flex flex-col gap-3.5 md:order-none md:sticky md:top-6">
        <TableOfContents entries={toc} />
      </aside>
    </Container>
  );
}
