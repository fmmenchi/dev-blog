import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Use `article` for self-contained content like a post preview. */
  as?: 'div' | 'article' | 'section';
  /** Lifts and highlights the border on hover — for cards that are links. */
  interactive?: boolean;
}

const BASE = 'bg-card text-card-foreground border border-border rounded-xl p-6';

/*
 * Interactive cards lift and highlight on hover (design mock behavior).
 *
 * The lift is written as a raw `transform` on purpose: Tailwind's
 * `-translate-y-*` utilities set the modern `translate` property, and
 * `--transition-lift` animates `transform` — the lift would snap instead of
 * easing, and nothing would say why.
 */
const INTERACTIVE =
  '[transition:var(--transition-lift)] hover:border-primary ' +
  'hover:[transform:translateY(-2px)]';

export function Card({
  as: Component = 'div',
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(BASE, interactive && INTERACTIVE, className)}
      {...props}
    />
  );
}
