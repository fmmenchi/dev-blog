import { SITE_NAME } from './site';

/**
 * Shared SEO meta builder: title/description, OpenGraph, Twitter card and
 * the canonical link. `origin` comes from the root loader and is always the
 * canonical SITE_URL, regardless of the host the request arrived on.
 */

export interface SeoInput {
  origin: string;
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'article';
}

interface RootMatch {
  id: string;
  loaderData?: unknown;
}

/** Reads the origin provided by the root loader out of a route's matches. */
export function originFromMatches(matches: (RootMatch | undefined)[]): string {
  const root = matches.find((match) => match?.id === 'root');
  const data = root?.loaderData as { origin?: string } | undefined;
  return data?.origin ?? '';
}

export function seoMeta({
  origin,
  path,
  title,
  description,
  type = 'website',
}: SeoInput) {
  const url = `${origin}${path}`;

  /*
   * The card is one image for the whole site, and the URL is ABSOLUTE on purpose:
   * a crawler reads the tag out of context and will not resolve a relative path.
   *
   * `summary_large_image`, not `summary`: the site used to declare `summary` with no
   * image at all, which produces no card — every link shared to LinkedIn, Slack or
   * WhatsApp arrived as a grey line of text.
   *
   * The PNG is generated from the site's own tokens and fonts by tools/og-image.mjs.
   */
  const image = `${origin}/og.png`;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    {
      property: 'og:image:alt',
      content: `${SITE_NAME} — software, systems and the decisions behind the code`,
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: image },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
}
