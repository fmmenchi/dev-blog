import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

/*
 * Every class below resolves to a SEMANTIC token through the Tailwind bridge:
 * `text-muted-foreground` is `--color-muted-foreground`, `border-border` is
 * `--color-border`. No palette, no literal colour.
 */
export const badgeVariants = cva(
  'inline-block leading-normal border py-0.5 px-2 border-border',
  {
    variants: {
      variant: {
        /* Skill/topic chips (sidebar). */
        outline: 'rounded-full text-muted-foreground text-sm font-medium',
        /* Post tags (#meta) — monospace, in the accent. */
        tag: 'rounded-sm text-primary font-mono text-xs',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, BadgeVariants {}

/** Small label, e.g. a skill chip or a post tag. Purely presentational. */
export function Badge({ variant, className, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
