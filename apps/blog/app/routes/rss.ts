import { getPosts } from '../lib/posts.server';
import { buildRssFeed } from '../lib/rss.server';
import { SITE_URL } from '../lib/site';

export function loader() {
  const feed = buildRssFeed(SITE_URL, getPosts());
  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
