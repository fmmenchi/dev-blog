import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../internal/cn';
import { Link } from '../link/link.component';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'ghost';

interface CommonProps {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps =
  | (CommonProps &
      Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'className' | 'children'
      > & { href?: never })
  | (CommonProps & { href: string });

/**
 * Icon-only usage requires an `aria-label` (or `aria-labelledby`): the button
 * must always have an accessible name.
 *
 * With `href` it renders a real anchor that looks like a button — an action
 * that navigates (a `mailto:`, an external URL) must be a link, not a
 * `<button>`, or it loses middle-click, "open in new tab" and the right role.
 * The href is handed to `Link`, so protocol handling stays in one place.
 */
export function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(styles['button'], styles[variant], className);

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} variant="plain" className={classes}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
