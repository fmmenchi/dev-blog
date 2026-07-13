import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

/*
 * No variants — the cva wrapper is here for consistency with the rest of the
 * library, so a Container class list is read (and extended) the same way as
 * every other component's.
 *
 * The width comes from `max-w-content`, which the bridge generates from
 * `--layout-content-width`. It used to be an arbitrary value here, which is a
 * token missing from the bridge wearing a disguise.
 */
export const containerVariants = cva(
  'w-full max-w-content mx-auto px-4 box-border',
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
