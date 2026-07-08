import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Use `article` for self-contained content like a post preview. */
  as?: 'div' | 'article' | 'section';
}

export function Card({
  as: Component = 'div',
  className,
  ...props
}: CardProps) {
  return <Component className={cn(styles['card'], className)} {...props} />;
}
