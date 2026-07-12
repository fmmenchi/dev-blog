import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../internal/cn';
import { Link } from '../link/link.component';

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

const BASE =
  'inline-flex items-center gap-2 py-2 px-4 border border-transparent ' +
  'rounded-md font-sans text-base font-medium leading-normal ' +
  /* An href renders an <a>, which would otherwise underline itself. */
  'no-underline cursor-pointer [transition:var(--transition-color)] ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/*
 * `hover:not-disabled:` — not `enabled:hover:`. With an href the button renders
 * an <a>, and `:enabled` never matches an anchor: the hover state would silently
 * disappear on exactly the links that look like buttons.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground ' +
    'hover:not-disabled:bg-primary-hover active:not-disabled:bg-primary-active',
  ghost:
    'bg-transparent text-foreground border-border ' +
    'hover:not-disabled:bg-muted',
};

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
  const classes = cn(BASE, VARIANT[variant], className);

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
