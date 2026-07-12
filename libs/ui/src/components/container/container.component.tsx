import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

/*
 * No variants — the cva wrapper is here for consistency with the rest of the
 * library, so a Container class list is read (and extended) the same way as
 * every other component's.
 *
 * `--layout-content-width` is a token, but a layout one: the bridge in
 * `tailwind.css` exposes colours, type and radii — not widths. Read it directly
 * rather than re-typing 70rem here.
 */
export const containerVariants = cva(
  'w-full max-w-[var(--layout-content-width)] mx-auto px-4 box-border',
);

export type ContainerVariants = VariantProps<typeof containerVariants>;

export interface ContainerProps
  extends HTMLAttributes<HTMLElement>, ContainerVariants {
  /** Use `main` for the page's main landmark (exactly one per page). */
  as?: 'div' | 'main' | 'header' | 'footer';
}

export function Container({
  as: Component = 'div',
  className,
  ...props
}: ContainerProps) {
  return (
    <Component className={cn(containerVariants(), className)} {...props} />
  );
}
