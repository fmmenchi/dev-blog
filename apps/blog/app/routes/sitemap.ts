import type { LoaderFunctionArgs } from 'react-router';

import { getPosts } from '../lib/posts.server';

export function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;
  const staticPaths = ['/', '/projects', '/about'];
  const urls = [
    ...staticPaths.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
    ...getPosts().map(
      (post) =>
        `  <url><loc>${origin}/blog/${post.slug}</loc><lastmod>${post.date}</lastmod></url>`,
    ),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
