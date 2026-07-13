import { Container, IconLinks, Link } from '@dev-blog/ui';

import { getBuildInfo } from '../lib/build-info';
import { socialLinks } from '../lib/social-links';

const LINK =
  'text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary';

/**
 * The bottom of the shell. It lives here and not in `@dev-blog/ui` for the same reason
 * `SiteHeader` does: the design system owns the reusable PIECES (`Container`, `Link`,
 * `IconLinks` — none of which know that this blog has a GitHub), and the app owns the
 * arrangement that is this site and no other.
 */
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
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          © 2026 fabiomenchicchi.com
          {/* Decorative: a screen reader announcing "middle dot" helps nobody. */}
          <span aria-hidden="true">·</span>
          {/*
           * `♥` the CHARACTER, not the ❤️ emoji: an emoji is a colour font, it is red
           * and stays red. This one is `text-primary`, so it follows the accent the
           * reader picked (yellow / lime / amber) without knowing the accent exists.
           *
           * A heart says nothing out loud, so the word is spelled for screen readers
           * and hidden from everyone else: the line is announced "built with love".
           */}
          <span className="whitespace-nowrap">
            built with{' '}
            <span aria-hidden="true" className="text-primary">
              ♥
            </span>
            <span className="sr-only">love</span>
          </span>
          <span aria-hidden="true">·</span>
          {/*
           * Which build you are reading: the tag `nx release` cut, and the commit it
           * was cut from. Quieter than the copyright, because it is a footnote to the
           * page and not a peer of it — and `nowrap`, so the narrowest phone either
           * fits the whole thing or moves the whole thing, but can never strand
           * "(a1b2c3d)" alone on a line.
           */}
          <span className="whitespace-nowrap text-2xs">
            v{version}
            {commit ? ` (${commit})` : ''}
          </span>
        </span>

        {/*
         * On a phone this group takes the whole row and pushes the icons to the far
         * edge, so the words sit left and the icons right instead of trailing them in
         * one loose left-aligned run. From `md` up the footer is a single line again
         * and the group is just the right-hand end of it.
         */}
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 md:w-auto md:justify-end md:gap-4.5">
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
            {/* A resource route: `reloadDocument` asks for a real document request.
                Never a raw <a href="/…">, which would full-reload the app. */}
            <Link to="/rss.xml" reloadDocument variant="plain" className={LINK}>
              rss
            </Link>
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
