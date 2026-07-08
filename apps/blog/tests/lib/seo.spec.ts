import { loader as robotsLoader } from '../../app/routes/robots';
import { loader as sitemapLoader } from '../../app/routes/sitemap';
import { originFromMatches, seoMeta } from '../../app/lib/seo';

describe('seoMeta', () => {
  const tags = seoMeta({
    origin: 'https://fabio.dev',
    path: '/about',
    title: 'About — fabio.dev',
    description: 'Bio.',
  });

  it('emits canonical, OpenGraph and Twitter tags', () => {
    expect(tags).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: 'https://fabio.dev/about',
    });
    expect(tags).toContainEqual({
      property: 'og:url',
      content: 'https://fabio.dev/about',
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
      request: new Request('https://fabio.dev/sitemap.xml'),
    } as never);
    const xml = await res.text();
    expect(xml).toContain('<loc>https://fabio.dev/</loc>');
    expect(xml).toContain('<loc>https://fabio.dev/projects</loc>');
    expect(xml).toContain(
      '<loc>https://fabio.dev/blog/rewrote-my-blog-in-200-lines</loc>',
    );
    expect(xml).toContain('<lastmod>2026-07-02</lastmod>');
  });
});

describe('robots.txt', () => {
  it('allows crawling and points to the sitemap', async () => {
    const res = robotsLoader({
      request: new Request('https://fabio.dev/robots.txt'),
    } as never);
    const body = await res.text();
    expect(body).toContain('Allow: /');
    expect(body).toContain('Sitemap: https://fabio.dev/sitemap.xml');
  });
});
