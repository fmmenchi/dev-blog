import type { LoaderFunctionArgs } from 'react-router';

import { getPosts } from '../lib/posts.server';
import { buildRssFeed } from '../lib/rss.server';

export function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;
  const feed = buildRssFeed(origin, getPosts());
  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
