import { loader as robotsLoader } from '../../app/routes/robots';
import { loader as sitemapLoader } from '../../app/routes/sitemap';
import { originFromMatches, seoMeta } from '../../app/lib/seo';
import { posts } from '../support/content';

describe('seoMeta', () => {
  const tags = seoMeta({
    origin: 'https://fabiomenchicchi.com',
    path: '/about',
    title: 'About — fabiomenchicchi.com',
    description: 'Bio.',
  });

  it('emits canonical, OpenGraph and Twitter tags', () => {
    expect(tags).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: 'https://fabiomenchicchi.com/about',
    });
    expect(tags).toContainEqual({
      property: 'og:url',
      content: 'https://fabiomenchicchi.com/about',
    });
    expect(tags).toContainEqual({ name: 'twitter:card', content: 'summary' });
  });

  it('reads the origin from the root match', () => {
    expect(
      originFromMatches([
        { id: 'root', loaderData: { origin: 'https://x.dev' } },
      ]),
    ).toBe('https://x.dev');
    expect(originFromMatches([])).toBe('');
  });
});

describe('sitemap.xml', () => {
  it('lists static pages and every post', async () => {
    const res = sitemapLoader({
      request: new Request('https://fabiomenchicchi.com/sitemap.xml'),
    } as never);
    const xml = await res.text();
    expect(xml).toContain('<loc>https://fabiomenchicchi.com/</loc>');
    expect(xml).toContain('<loc>https://fabiomenchicchi.com/projects</loc>');
    /* Every published post is listed, whichever they happen to be. */
    for (const post of posts) {
      expect(xml).toContain(
        `<loc>https://fabiomenchicchi.com/blog/${post.slug}</loc>`,
      );
      expect(xml).toContain(`<lastmod>${post.date}</lastmod>`);
    }
  });
});

describe('robots.txt', () => {
  it('allows crawling and points to the sitemap', async () => {
    const res = robotsLoader({
      request: new Request('https://fabiomenchicchi.com/robots.txt'),
    } as never);
    const body = await res.text();
    expect(body).toContain('Allow: /');
    expect(body).toContain('Sitemap: https://fabiomenchicchi.com/sitemap.xml');
  });
});
