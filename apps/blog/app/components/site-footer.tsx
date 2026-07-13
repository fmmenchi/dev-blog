import { Container, IconLinks, Link } from '@dev-blog/ui';

import { getBuildInfo } from '../lib/build-info';
import { socialLinks } from '../lib/social-links';

const LINK =
  'text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary';

export function SiteFooter() {
  /* A compile-time constant, not state: the same string on the server and after
     hydration, so it can be read during render. See app/lib/build-info.ts. */
  const { version, commit } = getBuildInfo();

  return (
    <footer className="border-t border-border">
      {/* Everything wraps on a phone rather than running off it. */}
      <Container
        padding="bar"
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-6 font-mono text-xs text-muted-foreground md:flex-nowrap"
      >
        {/*
         * Which build you are reading. The version is the git tag `nx release` cut for
         * this deploy; the hash is the commit it was cut from — together they turn
         * "the site is behaving oddly" into a thing that can be looked up. It stays a
         * plain string on purpose: a link would promise a page (a GitHub release) that
         * this footer does not own.
         */}
        <span>
          © 2026 fabiomenchicchi.com · v{version}
          {commit ? ` (${commit})` : ''}
        </span>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-4.5">
          {/*
           * Two groups, because they are two different things: pages of this site,
           * and places I am elsewhere. They used to sit in one row of text links,
           * which made "linkedin" read like a page you could navigate to — and left
           * /about (icons) and the footer (words) showing the same data two ways.
           */}
          <nav
            aria-label="Secondary"
            className="flex flex-wrap gap-x-4 gap-y-1 md:gap-4.5"
          >
            {/* rss.xml is a resource route — a real document request on purpose */}
            <a href="/rss.xml" className={LINK}>
              rss
            </a>
            <Link to="/colophon" variant="plain" className={LINK}>
              colophon
            </Link>
            <Link to="/uses" variant="plain" className={LINK}>
              uses
            </Link>
          </nav>

          {/* Brings its own <nav aria-label="Social"> — a sibling, never nested. */}
          <IconLinks label="Social" links={socialLinks} />
        </div>
      </Container>
    </footer>
  );
}
