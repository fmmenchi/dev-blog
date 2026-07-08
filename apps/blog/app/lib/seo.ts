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
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { name: 'twitter:card', content: 'summary' },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
}
