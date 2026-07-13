import {
  getPost,
  getPosts,
  parseFrontmatter,
} from '../../app/lib/posts.server';

describe('parseFrontmatter', () => {
  it('splits meta and body', () => {
    const { meta, body } = parseFrontmatter(
      '---\ntitle: Ciao\ntags: a, b\n---\n\nCorpo.',
    );
    expect(meta['title']).toBe('Ciao');
    expect(meta['tags']).toBe('a, b');
    expect(body).toBe('Corpo.');
  });

  it('returns the raw text when no frontmatter is present', () => {
    const { meta, body } = parseFrontmatter('Solo corpo.');
    expect(meta).toEqual({});
    expect(body).toBe('Solo corpo.');
  });
});

describe('posts', () => {
  it('loads all markdown posts sorted by date desc', () => {
    const posts = getPosts();
    expect(posts.length).toBeGreaterThanOrEqual(1);
    const dates = posts.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  /* Asserts that the frontmatter is PARSED, not what any given post happens to say. */
  it('parses the frontmatter of every published post', () => {
    for (const { slug, title, minutes, tags, body } of getPosts()) {
      const post = getPost(slug);
      expect(post?.title).toBe(title);
      expect(title.length).toBeGreaterThan(0);
      expect(minutes).toBeGreaterThan(0);
      expect(tags.length).toBeGreaterThan(0);
      /* The frontmatter block itself must not survive into the body. */
      expect(body.startsWith('---')).toBe(false);
    }
  });

  it('marks exactly one post as featured', () => {
    expect(getPosts().filter((post) => post.featured)).toHaveLength(1);
  });
});
