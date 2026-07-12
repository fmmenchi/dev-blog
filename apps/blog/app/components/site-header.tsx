import { Link } from '@dev-blog/ui';
// NavLink stays a router primitive: the design-system Link has no notion of
// the aria-current active state the main nav needs.
import { NavLink } from 'react-router';

import { AccentSwitcher } from './accent-switcher';

const NAV = [
  { to: '/blog', label: '/blog' },
  { to: '/projects', label: '/projects' },
  { to: '/about', label: '/about' },
] as const;

const NAVLINK =
  'no-underline [transition:var(--transition-color)] hover:text-primary';

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <a
        href="#content"
        className="absolute -top-16 left-4 z-10 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground no-underline focus-visible:top-3"
      >
        Skip to content
      </a>
      {/* Wraps on a phone. The logo plus five mono nav items do not fit in
          375px on one line — and never did: the row simply ran off-screen, and
          every page scrolled sideways. */}
      <div className="mx-auto flex max-w-[var(--layout-content-width)] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:flex-nowrap md:px-8 md:py-5.5">
        <Link
          to="/"
          variant="plain"
          className="font-mono text-base font-bold text-inherit no-underline"
        >
          fabiomenchicchi<span className="text-primary">.com</span>
        </Link>
        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[13px] md:gap-7"
        >
          {NAV.map(({ to, label }) => (
            // No `end`: reading /blog/:slug keeps /blog marked as the section.
            <NavLink
              key={to}
              to={to}
              // The idle/active colour is swapped, not layered: two competing
              // `text-*` utilities in one class list are resolved by stylesheet
              // order, not by the order they are written in.
              className={({ isActive }) =>
                isActive
                  ? `${NAVLINK} text-primary`
                  : `${NAVLINK} text-muted-foreground`
              }
            >
              {label}
            </NavLink>
          ))}
          <a href="/rss.xml" className={`${NAVLINK} text-muted-foreground`}>
            /rss
          </a>
          <AccentSwitcher />
        </nav>
      </div>
    </header>
  );
}
