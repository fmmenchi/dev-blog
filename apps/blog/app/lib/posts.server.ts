/**
 * Markdown content pipeline: posts live in `content/posts/*.md` with a
 * frontmatter block. Files are bundled at build time via import.meta.glob,
 * so loaders need no filesystem access.
 */

export interface Post {
  slug: string;
  title: string;
  date: string;
  minutes: number;
  tags: string[];
  excerpt: string;
  featured: boolean;
  /** Markdown body (without frontmatter). */
  body: string;
}

const files = import.meta.glob('../../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

export function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = FRONTMATTER.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { meta, body: raw.slice(match[0].length).trim() };
}

function toPost(path: string, raw: string): Post {
  const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta['title'] ?? slug,
    date: meta['date'] ?? '',
    minutes: Number(meta['minutes'] ?? 1),
    tags: meta['tags'] ? meta['tags'].split(',').map((t) => t.trim()) : [],
    excerpt: meta['excerpt'] ?? '',
    featured: meta['featured'] === 'true',
    body,
  };
}

const all = Object.entries(files)
  .map(([path, raw]) => toPost(path, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPosts(): Post[] {
  return all;
}

export function getPost(slug: string): Post | undefined {
  return all.find((post) => post.slug === slug);
}
