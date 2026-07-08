import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './badge.module.css';

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

/** Small label, e.g. a post tag. Purely presentational. */
export function Badge({ className, ...props }: BadgeProps) {
  return <span className={cn(styles['badge'], className)} {...props} />;
}
