import type { ReactNode } from 'react';

import { cn } from '../../internal/cn';
import styles from './empty-state.module.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Actions (buttons/links) rendered under the description. */
  children?: ReactNode;
  className?: string;
}

/**
 * Placeholder for a list that has nothing in it yet.
 *
 * Unlike `ErrorState` it carries no `<h1>`: an empty state sits inside a page
 * that already has its own heading, and a second `<h1>` would break the
 * document outline (WCAG 1.3.1).
 */
export function EmptyState({
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(styles['state'], className)}>
      <p className={styles['title']}>{title}</p>
      {description ? (
        <p className={styles['description']}>{description}</p>
      ) : null}
      {children ? <div className={styles['actions']}>{children}</div> : null}
    </div>
  );
}
