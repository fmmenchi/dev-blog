import { expect, test } from '@playwright/test';

test.describe('feeds and crawlers', () => {
  test('rss.xml serves a real feed', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/rss+xml');
    const body = await res.text();
    expect(body).toContain('<rss version="2.0"');
    expect(body).toContain(
      'https://fabiomenchicchi.com/blog/rewrote-my-blog-in-200-lines',
    );
  });

  test('sitemap.xml lists pages and posts', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<loc>https://fabiomenchicchi.com/</loc>');
    expect(body).toContain('<loc>https://fabiomenchicchi.com/projects</loc>');
  });

  test('robots.txt allows crawling and points to the sitemap', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain(
      'Sitemap: https://fabiomenchicchi.com/sitemap.xml',
    );
  });
});
