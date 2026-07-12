import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

/*
 * Every class below resolves to a SEMANTIC token through the Tailwind bridge:
 * `bg-card` is `--color-card`, `border-border` is `--color-border`. No palette,
 * no literal colour.
 *
 * `interactive` is a BOOLEAN variant: cva keys it by the stringified value, so
 * `true` carries the hover behaviour and `false` carries nothing — the prop
 * stays a plain `interactive?: boolean` on the outside.
 *
 * Interactive cards lift and highlight on hover (design mock behavior). The
 * lift is written as a raw `transform` on purpose: Tailwind's `-translate-y-*`
 * utilities set the modern `translate` property, and `--transition-lift`
 * animates `transform` — the lift would snap instead of easing, and nothing
 * would say why.
 */
export const cardVariants = cva(
  'bg-card text-card-foreground border border-border rounded-xl p-6',
  {
    variants: {
      interactive: {
        true:
          '[transition:var(--transition-lift)] hover:border-primary ' +
          'hover:[transform:translateY(-2px)]',
        false: '',
      },
    },
    defaultVariants: { interactive: false },
  },
);

export type CardVariants = VariantProps<typeof cardVariants>;

export interface CardProps extends HTMLAttributes<HTMLElement>, CardVariants {
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
      className={cn(cardVariants({ interactive }), className)}
      {...props}
    />
  );
}
