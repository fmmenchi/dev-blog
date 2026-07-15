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
}

const publishedFrontmatters = import.meta.glob('../../content/posts/*.mdx', {
  eager: true,
  import: 'frontmatter',
}) as Record<string, Frontmatter>;

const publishedTocs = import.meta.glob('../../content/posts/*.mdx', {
  eager: true,
  import: 'toc',
}) as Record<string, TocEntry[]>;

/*
 * Drafts are a separate, committed folder that ships ONLY while developing. In the
 * production build `import.meta.env.DEV` is the literal `false`, so these globs sit in
 * dead code and the bundler drops them along with every module they would have pulled in
 * — a draft's frontmatter, its table of contents and (in post.tsx) its body never reach
 * the deployed site. Publish a draft by moving its file into content/posts/.
 *
 * See post.tsx for the matching gate on the content component.
 */
const draftFrontmatters = import.meta.env.DEV
  ? (import.meta.glob('../../content/drafts/*.mdx', {
      eager: true,
      import: 'frontmatter',
    }) as Record<string, Frontmatter>)
  : {};

const draftTocs = import.meta.env.DEV
  ? (import.meta.glob('../../content/drafts/*.mdx', {
      eager: true,
      import: 'toc',
    }) as Record<string, TocEntry[]>)
  : {};

const frontmatters = { ...publishedFrontmatters, ...draftFrontmatters };
const tocs = { ...publishedTocs, ...draftTocs };

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
    toc: tocs[path] ?? [],
  };
}

const all = Object.entries(frontmatters)
  .map(([path, meta]) => toPost(path, meta))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPosts(): Post[] {
  return all;
}

export function getPost(slug: string): Post | undefined {
  return all.find((post) => post.slug === slug);
}
