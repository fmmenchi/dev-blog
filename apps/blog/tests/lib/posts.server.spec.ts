import {
  getPost,
  getPosts,
  listPublished,
  resolvePost,
  type Post,
} from '../../app/lib/posts.server';

/** A minimal post; the draft tests only care about slug + draft. */
function post(slug: string, draft = false): Post {
  return {
    slug,
    title: slug,
    date: '2026-01-01',
    minutes: 1,
    tags: [],
    excerpt: '',
    featured: false,
    draft,
    toc: [],
  };
}

/*
 * There is no `parseFrontmatter` to test any more, and that is the point: the frontmatter
 * is real YAML now, parsed by remark at build time — not by a regex of ours that split on
 * the first colon and called whatever followed a value.
 *
 * What is left to check is that the data ARRIVES, and arrives typed.
 */
describe('the posts', () => {
  it('are sorted newest first', () => {
    const dates = getPosts().map((post) => post.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('carry their frontmatter, parsed and typed', () => {
    for (const { slug, title, minutes, tags, date } of getPosts()) {
      const post = getPost(slug);

      expect(post?.title).toBe(title);
      expect(title.length).toBeGreaterThan(0);
      expect(minutes).toBeGreaterThan(0);
      /* `tags: meta, tooling` is one YAML line; a list is what the site needs. */
      expect(tags.length).toBeGreaterThan(0);
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
  });

  it('carry a table of contents built from their headings', () => {
    /*
     * The TOC used to be scraped back out of the HTML string that marked produced. That
     * string was already escaped, and React escaped it again, so a heading with an
     * apostrophe reached the page as `What doesn&#39;t`. It now comes off the syntax
     * tree, before anything has become HTML — there is nothing to escape and nothing to
     * undo.
     */
    for (const post of getPosts()) {
      expect(post.toc.length).toBeGreaterThan(0);

      for (const entry of post.toc) {
        expect(entry.text.length).toBeGreaterThan(0);
        expect(entry.text).not.toContain('&#');
        /* The id must be the one rehype-slug puts on the heading, or the anchor points
           at nothing: lowercase, no spaces, no punctuation. */
        expect(entry.id).toMatch(/^[\p{L}\p{N}_-]+$/u);
      }
    }
  });

  it('mark exactly one post as featured', () => {
    expect(getPosts().filter((post) => post.featured)).toHaveLength(1);
  });

  it('return nothing for a slug that does not exist', () => {
    expect(getPost('no-such-post')).toBeUndefined();
  });

  it('are all published — a draft never reaches a listing', () => {
    /* getPosts is the one chokepoint the home, blog, feed and sitemap all read. */
    expect(getPosts().every((p) => !p.draft)).toBe(true);
  });
});

/*
 * The draft rules, tested on fabricated posts so they do not depend on what happens to be
 * in content/posts. A draft is written in the open but not published: kept out of every
 * listing, and reachable by URL only where drafts are allowed to exist — in dev, never in
 * the built site.
 */
describe('draft visibility', () => {
  const sample = [post('published'), post('secret', true)];

  it('listPublished drops drafts', () => {
    expect(listPublished(sample).map((p) => p.slug)).toEqual(['published']);
  });

  it('resolvePost always finds a published post', () => {
    expect(resolvePost(sample, 'published', false)?.slug).toBe('published');
    expect(resolvePost(sample, 'published', true)?.slug).toBe('published');
  });

  it('resolvePost hides a draft in production and shows it in dev', () => {
    /* draftsVisible=false is the built site: a draft 404s like a missing slug. */
    expect(resolvePost(sample, 'secret', false)).toBeUndefined();
    /* draftsVisible=true is the dev server: the author can preview it by URL. */
    expect(resolvePost(sample, 'secret', true)?.slug).toBe('secret');
  });

  it('resolvePost returns nothing for a slug that is not there', () => {
    expect(resolvePost(sample, 'ghost', true)).toBeUndefined();
  });
});
