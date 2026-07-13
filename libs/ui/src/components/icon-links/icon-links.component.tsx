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
  /**
   * A navigation LANDMARK, or just a labelled list?
   *
   * A landmark is a promise: *this is one of the few places worth jumping to*. Two of
   * them carrying the same name is worse than none — a screen-reader user opens the
   * landmark list and finds two identical "Social" entries with no way to tell them
   * apart. Which is exactly what /about shipped: a `Social` nav in the profile card, and
   * another in the footer.
   *
   * So the footer's row passes `landmark={false}` and renders a labelled LIST. It is
   * still announced — "Social, list, 3 items" — it just stops claiming to be a place.
   */
  landmark?: boolean;
  className?: string;
}

const ITEM =
  'inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground [transition:var(--transition-color)] hover:border-primary hover:text-primary';

/**
 * A row of icon-only links.
 *
 * It takes its links as props and reads nothing: that is what makes it design system
 * rather than app code. The blog's social list, the icon registry, the ordering — all of
 * that belongs to whoever calls it.
 *
 * Accessibility is the whole reason this is a component and not three `<a>`s: an
 * icon-only link with no accessible name is announced as nothing at all (WCAG 4.1.2),
 * and the icon must be `aria-hidden` or the same thing is said twice. Both are enforced
 * here, so no caller can forget them.
 *
 * The icons inherit `currentColor`, so they follow the accent without knowing it exists.
 */
export function IconLinks({
  label,
  links,
  landmark = true,
  className,
}: IconLinksProps) {
  const items = links.map(({ label: name, href, icon: Icon }) => (
    <Link key={name} href={href} variant="plain" className={ITEM}>
      <Icon aria-hidden="true" className="size-4.5" />
      {/* The name goes INSIDE, not in an aria-label: a label would override the content,
          and with it the "(opens in a new tab)" hint that Link appends for screen readers
          (WCAG 2.4.4). Learned the hard way. */}
      <span className="sr-only">{name}</span>
    </Link>
  ));

  const classes = cn('flex flex-wrap items-center gap-2', className);

  if (!landmark) {
    /* A <ul> takes <li> children and nothing else — an `<a>` sitting directly inside one
       is its own violation, traded for the one we just fixed. */
    return (
      <ul aria-label={label} className={cn(classes, 'list-none')}>
        {items.map((item) => (
          <li key={item.key}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <nav aria-label={label} className={classes}>
      {items}
    </nav>
  );
}
