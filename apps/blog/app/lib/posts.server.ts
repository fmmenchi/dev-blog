/**
 * The posts. MDX modules under `content/posts/*.mdx`, compiled at BUILD time.
 *
 * They used to be Markdown strings, parsed at request time by `marked` and injected with
 * dangerouslySetInnerHTML. That is why a post could not contain a single component of
 * ours: an HTML string has no idea that <Image> or <Link> exist. Images came out as bare
 * <img> — no srcset, no intrinsic size (so they shoved the page down as they landed), no
 * lazy loading — and every internal link was a raw <a>, which reloads the whole document
 * instead of routing.
 *
 * Compiling to components fixes the cause rather than the symptoms, and takes the parser
 * out of the runtime entirely: `marked` no longer ships.
 *
 * The frontmatter and the table of contents are DATA, so they are read here, eagerly, and
 * travel through the loader. The post's content is a COMPONENT, so it is loaded by the
 * route that renders it — see post.tsx. Keeping the two apart is what stops the blog
 * index from dragging every article's body into the bundle.
 */

export interface TocEntry {
  id: string;
  text: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  minutes: number;
  tags: string[];
  excerpt: string;
  featured: boolean;
  /**
   * A draft is written in the open but not published: it is kept out of every listing,
   * the feed and the sitemap, and its page 404s in the built site. See getPost/getPosts.
   */
  draft: boolean;
  /** Its `##` headings, collected from the syntax tree by tools/remark-toc.mjs. */
  toc: TocEntry[];
}

/** YAML, parsed by remark-mdx-frontmatter — not by a regex of ours. */
interface Frontmatter {
  title?: string;
  date?: string;
  minutes?: number;
  tags?: string;
  excerpt?: string;
  featured?: boolean;
  draft?: boolean;
}

const frontmatters = import.meta.glob('../../content/posts/*.mdx', {
  eager: true,
  import: 'frontmatter',
}) as Record<string, Frontmatter>;

const tocs = import.meta.glob('../../content/posts/*.mdx', {
  eager: true,
  import: 'toc',
}) as Record<string, TocEntry[]>;

export function slugOf(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.mdx$/, '');
}

function toPost(path: string, meta: Frontmatter): Post {
  const slug = slugOf(path);

  return {
    slug,
    title: meta.title ?? slug,
    date: String(meta.date ?? ''),
    minutes: Number(meta.minutes ?? 1),
    /* Written as `tags: meta, tooling` — one line, and a list is what we want. */
    tags: meta.tags
      ? String(meta.tags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    excerpt: meta.excerpt ?? '',
    featured: meta.featured === true,
    draft: meta.draft === true,
    toc: tocs[path] ?? [],
  };
}

const all = Object.entries(frontmatters)
  .map(([path, meta]) => toPost(path, meta))
  .sort((a, b) => b.date.localeCompare(a.date));

/*
 * The draft rules, kept pure and separate from how the posts are loaded, so they can be
 * tested without a fixture on disk. A draft never appears in a list; it is reachable by
 * its own URL, but only where drafts are allowed to exist at all.
 */

/** Published posts only — what every listing, the feed and the sitemap should show. */
export function listPublished(posts: Post[]): Post[] {
  return posts.filter((post) => !post.draft);
}

/**
 * The post at `slug`, or nothing. A draft resolves only when `draftsVisible`; in the
 * built site that is false, so a draft's URL 404s like a slug that was never written.
 */
export function resolvePost(
  posts: Post[],
  slug: string,
  draftsVisible: boolean,
): Post | undefined {
  const post = posts.find((p) => p.slug === slug);
  if (!post) return undefined;
  return post.draft && !draftsVisible ? undefined : post;
}

export function getPosts(): Post[] {
  return listPublished(all);
}

export function getPost(slug: string): Post | undefined {
  /* Drafts are viewable while developing, and nowhere else. `import.meta.env.DEV` is
     replaced with a literal at build time, so the check costs nothing in production. */
  return resolvePost(all, slug, import.meta.env.DEV);
}
