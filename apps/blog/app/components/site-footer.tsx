import { Link } from '@dev-blog/ui';

import { socials } from '../lib/content';

const LINK =
  'text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      {/* Six links plus the copyright: they wrap on a phone rather than run off it. */}
      <div className="mx-auto flex max-w-[var(--layout-content-width)] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-6 font-mono text-xs text-muted-foreground md:flex-nowrap md:px-8">
        <span>© 2026 fabiomenchicchi.com</span>
        <nav
          aria-label="Secondary"
          className="flex flex-wrap gap-x-4 gap-y-1 md:gap-4.5"
        >
          {socials.map(({ label, href }) => (
            <Link key={label} href={href} variant="plain" className={LINK}>
              {label}
            </Link>
          ))}
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
      </div>
    </footer>
  );
}
