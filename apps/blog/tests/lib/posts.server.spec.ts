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
    expect(posts.length).toBeGreaterThanOrEqual(5);
    const dates = posts.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('exposes the featured post with parsed frontmatter', () => {
    const post = getPost('rewrote-my-blog-in-200-lines');
    expect(post?.title).toBe('I rewrote my blog in 200 lines');
    expect(post?.minutes).toBe(6);
    expect(post?.tags).toEqual(['web', 'minimalism']);
    expect(post?.featured).toBe(true);
    expect(post?.body).toContain('## The problem');
  });
});
