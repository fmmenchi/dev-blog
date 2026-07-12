import { cva, type VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import { cn } from '../../internal/cn';

const PROTOCOL_HREF = /^([a-z][a-z0-9+.-]*:|\/\/)/i;
const NEW_TAB_HREF = /^(https?:|\/\/)/i;

/*
 * The shared classes are NOT the cva base: `plain` must render nothing at all —
 * cards and buttons wrap a `plain` Link and supply their own looks, and a base
 * would leak a radius, a weight and a transition into them. cva cannot subtract
 * from its base, so the base is empty and the shared part is spliced into the
 * two variants that actually want it.
 *
 * Every class resolves to a SEMANTIC token through the Tailwind bridge:
 * `text-primary` is `--color-primary`, `text-muted-foreground` is
 * `--color-muted-foreground`. No palette, no literal colour.
 */
const SHARED =
  'rounded-sm font-medium underline-offset-[0.25em] [transition:var(--transition-color)]';

export const linkVariants = cva('', {
  variants: {
    variant: {
      default: `${SHARED} text-primary underline hover:text-primary-hover`,
      subtle: `${SHARED} text-muted-foreground no-underline hover:text-foreground hover:underline`,
      /* `plain` carries no visual styling — behavior only. */
      plain: '',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type LinkVariants = VariantProps<typeof linkVariants>;

interface BaseLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, LinkVariants {
  children: ReactNode;
  /** Forwarded to the router link: forces a full document load (e.g. /rss.xml). */
  reloadDocument?: boolean;
}

export type LinkProps = BaseLinkProps &
  ({ to: string; href?: never } | { href: string; to?: never });

/**
 * The one way to link things, andes-routes style:
 * - `to`   → React Router navigation (client-side, no reload);
 * - `href` → a normal anchor: http(s) opens in a new tab with rel protection
 *   and a screen-reader hint (WCAG 2.4.4 / 3.2.5); hash anchors and other
 *   protocols (mailto:) render plain. An internal-path `href` is promoted to
 *   a router navigation so internal links can never full-reload by mistake.
 * The `plain` variant carries no visual styling — behavior only.
 */
export function Link({
  to,
  href,
  variant,
  className,
  children,
  reloadDocument,
  ...props
}: LinkProps) {
  const classes = cn(linkVariants({ variant }), className);

  if (href !== undefined && NEW_TAB_HREF.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...props}
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  if (
    href !== undefined &&
    (PROTOCOL_HREF.test(href) || href.startsWith('#'))
  ) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink
      to={(to ?? href) as string}
      reloadDocument={reloadDocument}
      className={classes}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
