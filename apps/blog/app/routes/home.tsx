import { Avatar, Badge, Card, EmptyState, Link } from '@dev-blog/ui';
import { useLoaderData } from 'react-router';

import { SectionHeading } from '../components/section-heading';
import { profile } from '../lib/content';
import { getPosts } from '../lib/posts.server';

export function loader() {
  return { posts: getPosts() };
}

function compactDate(date: string) {
  return date.slice(5);
}

/** The home is a shop window, not the archive: featured post plus this many. */
const COMPACT_POSTS = 4;

/** `group` so the card title can react to a hover anywhere on the card link. */
const CARD_LINK = 'group block text-inherit no-underline';

export default function Home() {
  const { posts } = useLoaderData<typeof loader>();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts
    .filter((post) => post !== featured)
    .slice(0, COMPACT_POSTS);
  const hasMore = posts.length > rest.length + 1;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-[var(--layout-content-width)] px-8 pt-14 pb-5">
        <h1 className="mb-4.5 max-w-[48.75rem] text-[clamp(2.125rem,4.5vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.03em]">
          Software, systems and the{' '}
          <span className="text-primary">decisions</span> behind the code.
        </h1>
        <p className="max-w-[35rem] text-lg leading-copy text-balance text-muted-foreground">
          Honest notes on architecture, tooling and developer experience.
        </p>
      </div>

      {/* Phone: one column. From `md` the profile sidebar moves alongside. */}
      <div className="mx-auto grid max-w-[var(--layout-content-width)] grid-cols-1 items-start gap-5 px-8 pt-9 pb-16 md:grid-cols-[300px_1fr]">
        {/* Sticky only once there is a column to be sticky in. */}
        <aside className="flex flex-col gap-3.5 md:sticky md:top-6">
          <Card className="flex flex-col items-start gap-3.5">
            <Avatar name={profile.name} size={60} />
            <div>
              <p className="mb-1 text-[19px] font-bold">{profile.name}</p>
              <p className="text-[13.5px] leading-[1.55] text-muted-foreground">
                {profile.bioShort}
              </p>
            </div>
            <ul className="flex flex-wrap gap-1.75" aria-label="Skills">
              {profile.skills.map((skill) => (
                <li key={skill}>
                  <Badge>{skill}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-xl bg-primary p-5.5 text-primary-foreground">
            <p className="mb-2 font-mono text-2xs font-semibold">
              $ NOW BUILDING
            </p>
            <p className="text-[15px] leading-[1.35] font-semibold">
              {profile.building}
            </p>
            <p className="mt-4 font-mono text-2xs">
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

        <section className="flex flex-col gap-3.5" aria-label="Articles">
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
                className={CARD_LINK}
              >
                <Card
                  as="article"
                  interactive
                  className="flex flex-col gap-2.5"
                >
                  <div className="flex justify-between gap-4 font-mono text-2xs text-muted-foreground">
                    <span className="text-primary">★ latest</span>
                    <span>
                      {featured.date} · {featured.minutes} min
                    </span>
                  </div>
                  <h2 className="text-[26px] leading-[1.16] font-bold tracking-[-0.02em] [transition:var(--transition-color)] group-hover:text-primary">
                    {featured.title}
                  </h2>
                  <p className="max-w-[35rem] text-[14.5px] leading-copy text-muted-foreground">
                    {featured.excerpt}
                  </p>
                  <div className="mt-1.5 flex gap-2">
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
                  className={CARD_LINK}
                >
                  <Card
                    as="article"
                    interactive
                    className="flex items-center justify-between gap-5 py-5"
                  >
                    <div>
                      <h2 className="text-lg leading-[1.3] font-semibold [transition:var(--transition-color)] group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
                    <span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
                      {compactDate(post.date)} · {post.minutes} min
                    </span>
                  </Card>
                </Link>
              ))}

              {hasMore ? (
                <Link
                  to="/blog"
                  variant="plain"
                  className="self-start px-0.5 py-1.5 font-mono text-[13px] text-primary no-underline hover:text-primary-hover"
                >
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
