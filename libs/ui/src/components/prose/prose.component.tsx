import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './prose.module.css';

export type ProseProps = HTMLAttributes<HTMLDivElement>;

/** Typography wrapper for long-form content (post body). */
export function Prose({ className, ...props }: ProseProps) {
  return <div className={cn(styles['prose'], className)} {...props} />;
}
