import type { ReactNode } from 'react';

import { cn } from '../../internal/cn';
import styles from './error-state.module.css';

export type ErrorStateVariant = 'error' | 'empty';

export interface ErrorStateProps {
  title: string;
  description?: string;
  /** Actions (buttons/links) rendered under the description. */
  children?: ReactNode;
  className?: string;
  /**
   * `error` owns the page: its title IS the page's `<h1>` — a 404 has nothing
   * else on it. `empty` sits inside a page that already has a heading, so its
   * title is a paragraph: a second level-1 heading would break the document
   * outline (WCAG 1.3.1). Reach for the variant through `EmptyState`, which
   * names it.
   */
  variant?: ErrorStateVariant;
}

/** Centered state block: title, muted explanation, actions. */
export function ErrorState({
  title,
  description,
  children,
  className,
  variant = 'error',
}: ErrorStateProps) {
  return (
    <div className={cn(styles['state'], styles[variant], className)}>
      {variant === 'error' ? (
        <h1 className={styles['title']}>{title}</h1>
      ) : (
        <p className={styles['title']}>{title}</p>
      )}
      {description ? (
        <p className={styles['description']}>{description}</p>
      ) : null}
      {children ? <div className={styles['actions']}>{children}</div> : null}
    </div>
  );
}
