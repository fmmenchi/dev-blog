import { getPosts } from '../../app/lib/posts.server';
import { buildRssFeed } from '../../app/lib/rss.server';

describe('buildRssFeed', () => {
  const feed = buildRssFeed('https://fabiomenchicchi.com', getPosts());

  it('produces a valid RSS 2.0 envelope', () => {
    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain('<title>fabiomenchicchi.com</title>');
    expect(feed).toContain(
      '<atom:link href="https://fabiomenchicchi.com/rss.xml" rel="self"',
    );
  });

  it('lists every post with absolute permalinks and dates', () => {
    for (const post of getPosts()) {
      expect(feed).toContain(
        `<link>https://fabiomenchicchi.com/blog/${post.slug}</link>`,
      );
    }
    expect(feed).toContain('<pubDate>Thu, 02 Jul 2026 00:00:00 GMT</pubDate>');
  });

  it('escapes XML entities in text content', () => {
    const escaped = buildRssFeed('https://x.dev', [
      {
        slug: 's',
        title: 'a < b & c',
        excerpt: '"quoted"',
        date: '2026-01-01',
        minutes: 1,
        tags: [],
        featured: false,
        body: '',
      },
    ]);
    expect(escaped).toContain('a &lt; b &amp; c');
    expect(escaped).toContain('&quot;quoted&quot;');
  });
});
