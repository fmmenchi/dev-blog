import { getPost, getPosts } from '../../app/lib/posts.server';

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
});
