import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Use `main` for the page's main landmark (exactly one per page). */
  as?: 'div' | 'main' | 'header' | 'footer';
}

/*
 * `--layout-content-width` is a token, but a layout one: the bridge in
 * `tailwind.css` exposes colours, type and radii — not widths. Read it directly
 * rather than re-typing 70rem here.
 */
const BASE =
  'w-full max-w-[var(--layout-content-width)] mx-auto px-4 box-border';

export function Container({
  as: Component = 'div',
  className,
  ...props
}: ContainerProps) {
  return <Component className={cn(BASE, className)} {...props} />;
}
