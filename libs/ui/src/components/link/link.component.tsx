import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import { cn } from '../../internal/cn';
import styles from './link.module.css';

const EXTERNAL_HREF = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

export type LinkVariant = 'default' | 'subtle';

export interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: string;
  variant?: LinkVariant;
  children: ReactNode;
}

/**
 * Internal hrefs client-navigate via React Router; external hrefs open in a
 * new tab with a screen-reader hint (WCAG 2.4.4 / 3.2.5).
 */
export function Link({
  href,
  variant = 'default',
  className,
  children,
  ...props
}: LinkProps) {
  const classes = cn(styles['link'], styles[variant], className);

  if (EXTERNAL_HREF.test(href)) {
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

  return (
    <RouterLink to={href} className={classes} {...props}>
      {children}
    </RouterLink>
  );
}
