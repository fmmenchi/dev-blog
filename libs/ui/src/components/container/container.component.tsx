import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

/*
 * The widths come from `max-w-content` / `max-w-measure`, which the bridge
 * generates from `--layout-content-width` / `--layout-measure-width`. They used
 * to be arbitrary values here, which is a token missing from the bridge wearing
 * a disguise.
 *
 * Two variants, because the app has exactly two of each and no more:
 * - `width`: `content` is the page shell; `measure` is the narrower column the
 *   long-form prose pages (uses, colophon) read in.
 * - `padding`: `page` is the gutter of a page body; `bar` is the header/footer
 *   gutter, which is tighter on mobile because a bar has no prose to protect.
 *
 * VERTICAL spacing is deliberately NOT a variant: it changes per page, so it
 * belongs in the caller's `className`. Note that `cn` is a plain join, not
 * tailwind-merge — a `px-*` passed from a caller would NOT override the one a
 * variant emits, it would just fight it. Pick the variant instead.
 */
export const containerVariants = cva('w-full mx-auto box-border', {
  variants: {
    width: {
      content: 'max-w-content',
      measure: 'max-w-measure',
    },
    padding: {
      page: 'px-8',
      bar: 'px-4 md:px-8',
    },
  },
  defaultVariants: { width: 'content', padding: 'page' },
});

export type ContainerVariants = VariantProps<typeof containerVariants>;

export interface ContainerProps
  extends HTMLAttributes<HTMLElement>, ContainerVariants {
  /** Use `main` for the page's main landmark (exactly one per page). */
  as?: 'div' | 'main' | 'header' | 'footer';
}

export function Container({
  as: Component = 'div',
  width,
  padding,
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(containerVariants({ width, padding }), className)}
      {...props}
    />
  );
}
