import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * The published posts, read off disk.
 *
 * The e2e suite used to name a post — its slug in a `goto`, its title in a heading
 * assertion. Deleting one then turned `main` red, and the failures had nothing to do
 * with navigation, feeds or accessibility, which is what these specs are actually
 * about. A test that hardcodes content tests only that the content has not changed.
 *
 * The app bundles this same folder with `import.meta.glob`; here it is read directly,
 * because Playwright runs in Node and cannot import the app's server modules.
 */
/* Walked up from the cwd rather than resolved from `import.meta`: this file is compiled
   to CommonJS, where `import.meta` is not allowed, and Playwright's cwd depends on how
   the suite was launched. */
function findPostsDir(): string {
  let dir = process.cwd();

  for (;;) {
    const candidate = join(dir, 'apps/blog/content/posts');
    if (existsSync(candidate)) return candidate;

    const parent = dirname(dir);
    if (parent === dir) throw new Error('apps/blog/content/posts not found');
    dir = parent;
  }
}

const POSTS_DIR = findPostsDir();

export interface PostSummary {
  slug: string;
  title: string;
  tags: string[];
  date: string;
}

function read(file: string): PostSummary {
  const raw = readFileSync(join(POSTS_DIR, file), 'utf8');
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(raw)?.[1] ?? '';

  const field = (name: string) =>
    new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]?.trim() ?? '';

  return {
    slug: file.replace(/\.mdx$/, ''),
    title: field('title'),
    tags: field('tags')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    date: field('date'),
  };
}

/** Newest first — the same order the site shows them in. */
export const posts: PostSummary[] = readdirSync(POSTS_DIR)
  .filter((file) => file.endsWith('.mdx'))
  .map(read)
  .sort((a, b) => b.date.localeCompare(a.date));

export function firstPost(): PostSummary {
  const [post] = posts;
  if (!post) throw new Error('no posts: the e2e suite needs at least one');
  return post;
}
