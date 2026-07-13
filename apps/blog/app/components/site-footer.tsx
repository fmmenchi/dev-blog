import { Footer, type FooterNavItem } from '@dev-blog/ui';

import { getBuildInfo } from '../lib/build-info';
import { socialLinks } from '../lib/social-links';

/**
 * The blog's footer: everything `Footer` deliberately does not know.
 *
 * The routes, the socials, whose copyright it is and which build is deployed all live
 * here; the design system only knows how to arrange them. `/rss.xml` is a resource
 * route — a document, not a screen — so it asks for a real document request rather
 * than a client navigation.
 */
const NAV: FooterNavItem[] = [
  { label: 'rss', to: '/rss.xml', reloadDocument: true },
  { label: 'colophon', to: '/colophon' },
  { label: 'uses', to: '/uses' },
];

export function SiteFooter() {
  /* A compile-time constant, not state: the same string on the server and after
     hydration, so it can be read during render. See app/lib/build-info.ts. */
  const { version, commit } = getBuildInfo();

  return (
    <Footer
      copyright="© 2026 fabiomenchicchi.com"
      nav={NAV}
      social={socialLinks}
      buildInfo={{ version, commit }}
    />
  );
}
