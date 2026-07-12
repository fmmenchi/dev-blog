import type { ComponentType, SVGProps } from 'react';

import { cn } from '../../internal/cn';
import { Link } from '../link/link.component';

export interface IconLinkItem {
  /** The accessible name. An icon-only link has nothing else to announce. */
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface IconLinksProps {
  /** Names the group for assistive tech, e.g. "Social". */
  label: string;
  links: IconLinkItem[];
  className?: string;
}

/**
 * A row of icon-only links.
 *
 * It takes its links as props and reads nothing: that is what makes it design
 * system rather than app code. The blog's social list, the icon registry, the
 * ordering — all of that belongs to whoever calls it.
 *
 * Accessibility is the whole reason this is a component and not three `<a>`s:
 * an icon-only link with no accessible name is announced as nothing at all
 * (WCAG 4.1.2), and the icon must be `aria-hidden` or the same thing is said
 * twice. Both are enforced here, so no caller can forget them.
 *
 * The icons inherit `currentColor`, so they follow the accent without knowing
 * it exists.
 */
export function IconLinks({ label, links, className }: IconLinksProps) {
  return (
    <nav
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {links.map(({ label: name, href, icon: Icon }) => (
        <Link
          key={name}
          href={href}
          variant="plain"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground [transition:var(--transition-color)] hover:border-primary hover:text-primary"
        >
          <Icon aria-hidden="true" className="size-4.5" />
          {/* The name goes INSIDE, not in an aria-label: a label would override
              the content, and with it the "(opens in a new tab)" hint that Link
              appends for screen readers (WCAG 2.4.4). Learned the hard way. */}
          <span className="sr-only">{name}</span>
        </Link>
      ))}
    </nav>
  );
}
