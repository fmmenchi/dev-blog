import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './badge.module.css';

export type BadgeVariant = 'outline' | 'tag';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `outline` for skill/topic chips, `tag` for monospace post tags. */
  variant?: BadgeVariant;
}

/** Small label, e.g. a skill chip or a post tag. Purely presentational. */
export function Badge({
  variant = 'outline',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(styles['badge'], styles[variant], className)}
      {...props}
    />
  );
}
