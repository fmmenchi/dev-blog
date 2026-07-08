import type { ReactNode } from 'react';

import { cn } from '../../internal/cn';
import styles from './error-state.module.css';

export interface ErrorStateProps {
  title: string;
  description: string;
  /** Actions (buttons/links) rendered under the description. */
  children?: ReactNode;
  className?: string;
}

/** Centered error block: page title, muted explanation, actions. */
export function ErrorState({
  title,
  description,
  children,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(styles['state'], className)}>
      <h1 className={styles['title']}>{title}</h1>
      <p className={styles['description']}>{description}</p>
      {children ? <div className={styles['actions']}>{children}</div> : null}
    </div>
  );
}
