import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Use `article` for self-contained content like a post preview. */
  as?: 'div' | 'article' | 'section';
  /** Lifts and highlights the border on hover — for cards that are links. */
  interactive?: boolean;
}

export function Card({
  as: Component = 'div',
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        styles['card'],
        interactive && styles['interactive'],
        className,
      )}
      {...props}
    />
  );
}
