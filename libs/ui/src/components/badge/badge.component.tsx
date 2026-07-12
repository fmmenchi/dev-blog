import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

export type BadgeVariant = 'outline' | 'tag';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `outline` for skill/topic chips, `tag` for monospace post tags. */
  variant?: BadgeVariant;
}

const BASE = 'inline-block leading-normal border py-0.5 px-2 border-border';

const VARIANT: Record<BadgeVariant, string> = {
  /* Skill/topic chips (sidebar). */
  outline: 'rounded-full text-muted-foreground text-sm font-medium',
  /* Post tags (#meta) — monospace, in the accent. */
  tag: 'rounded-sm text-primary font-mono text-xs',
};

/** Small label, e.g. a skill chip or a post tag. Purely presentational. */
export function Badge({
  variant = 'outline',
  className,
  ...props
}: BadgeProps) {
  return <span className={cn(BASE, VARIANT[variant], className)} {...props} />;
}
