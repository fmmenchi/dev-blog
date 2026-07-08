import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './container.module.css';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Use `main` for the page's main landmark (exactly one per page). */
  as?: 'div' | 'main' | 'header' | 'footer';
}

export function Container({
  as: Component = 'div',
  className,
  ...props
}: ContainerProps) {
  return (
    <Component className={cn(styles['container'], className)} {...props} />
  );
}
