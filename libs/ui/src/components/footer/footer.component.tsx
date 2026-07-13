import { cn } from '../../internal/cn';
import { Container } from '../container/container.component';
import {
  IconLinks,
  type IconLinkItem,
} from '../icon-links/icon-links.component';
import { Link } from '../link/link.component';

/** The build the visitor is actually looking at. Where it comes from is the app's problem. */
export interface FooterBuildInfo {
  /** A released version, without the `v` — the component adds it. */
  version: string;
  /** Short commit hash. Omitted, or empty, hides the parentheses entirely. */
  commit?: string;
}

export interface FooterNavItem {
  label: string;
  to: string;
  /**
   * Forces a real document request. A resource route (`/rss.xml`) is a document,
   * not a screen: client-routing to it would hand the browser a page that does not
   * exist. Never reach for a raw `<a href="/…">` instead — that reloads the whole
   * app for a link that should not.
   */
  reloadDocument?: boolean;
}

export interface FooterProps {
  /** The copyright line, verbatim. The DS does not know what year it is, or whose site this is. */
  copyright: string;
  nav?: FooterNavItem[];
  /** Names the nav for assistive tech. "Secondary", because the header owns "Main". */
  navLabel?: string;
  social?: IconLinkItem[];
  socialLabel?: string;
  /** Absent: the build row does not render at all. */
  buildInfo?: FooterBuildInfo;
  className?: string;
}

/* Not `Link`'s `subtle` variant: that one underlines on hover and settles on
   `foreground`. The footer's links go to `primary` and never underline — the same
   deal the header's nav makes. */
const NAV_LINK =
  'text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary';

/**
 * The bottom of every page: who owns it, where else to go, and which build you are
 * reading.
 *
 * It knows none of that. The copyright string, the routes, the socials and the version
 * all arrive as props — that is what keeps this design system and not blog code. The
 * blog's own footer (`apps/blog/app/components/site-footer.tsx`) is the thing that
 * knows about `/colophon`, a GitHub account and a git tag.
 *
 * TWO bands, not one line. The build metadata is a status bar: separated by a rule,
 * quieter type, and on its own row — so the copyright line stays short enough to fit a
 * phone without wrapping, which is exactly what appending `· v0.20.3 (a1b2c3d)` to it
 * stopped doing. It is also the honest shape: a version is not a peer of a copyright,
 * it is a footnote to the whole page.
 *
 * The two link groups stay apart on purpose — pages of this site, and places its author
 * is elsewhere. One row of text links made "linkedin" read like somewhere you could
 * navigate to.
 */
export function Footer({
  copyright,
  nav,
  navLabel = 'Secondary',
  social,
  socialLabel = 'Social',
  buildInfo,
  className,
}: FooterProps) {
  return (
    <footer className={cn('border-t border-border', className)}>
      {/* Everything wraps on a phone rather than running off it. */}
      <Container
        padding="bar"
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-6 font-mono text-xs text-muted-foreground md:flex-nowrap"
      >
        <span>{copyright}</span>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-4.5">
          {nav?.length ? (
            <nav
              aria-label={navLabel}
              className="flex flex-wrap gap-x-4 gap-y-1 md:gap-4.5"
            >
              {nav.map(({ label, to, reloadDocument }) => (
                <Link
                  key={to}
                  to={to}
                  reloadDocument={reloadDocument}
                  variant="plain"
                  className={NAV_LINK}
                >
                  {label}
                </Link>
              ))}
            </nav>
          ) : null}

          {/* Brings its own <nav aria-label="Social"> — a sibling, never nested. */}
          {social?.length ? (
            <IconLinks label={socialLabel} links={social} />
          ) : null}
        </div>
      </Container>

      {buildInfo ? (
        <div className="border-t border-border">
          <Container
            padding="bar"
            className="py-3 font-mono text-2xs text-muted-foreground"
          >
            v{buildInfo.version}
            {buildInfo.commit ? ` (${buildInfo.commit})` : ''}
          </Container>
        </div>
      ) : null}
    </footer>
  );
}
