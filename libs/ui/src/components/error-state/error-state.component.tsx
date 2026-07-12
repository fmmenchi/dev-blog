import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '../../internal/cn';

/*
 * Two class groups vary with the same `variant`, so they are two cva functions
 * driven by one value — the wrapper and the title. The description and the
 * actions do not vary, so they stay plain constants.
 *
 * Every class resolves to a SEMANTIC token through the Tailwind bridge:
 * `border-border` is `--color-border`, `text-muted-foreground` is
 * `--color-muted-foreground`. No palette, no literal colour.
 */
export const errorStateVariants = cva(
  'flex flex-col items-center text-center',
  {
    variants: {
      variant: {
        /* Owns the page — a 404 or a 500, with nothing else on it. */
        error: 'gap-4',
        /* Sits inside a page that already has a heading: a list with nothing in it. */
        empty: 'gap-2 py-6 px-4 border border-dashed border-border rounded-lg',
      },
    },
    defaultVariants: { variant: 'error' },
  },
);

/*
 * The error title has no size token: it is fluid, and the type scale is not.
 * The tracking has a token, but no utility — the bridge exposes colours, type
 * and radii, not letter-spacing — so it is read through a var().
 */
export const errorStateTitleVariants = cva('m-0', {
  variants: {
    variant: {
      error:
        'font-bold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight ' +
        'tracking-[var(--typography-heading-tracking)]',
      empty: 'font-mono font-medium text-foreground',
    },
  },
  defaultVariants: { variant: 'error' },
});

export type ErrorStateVariants = VariantProps<typeof errorStateVariants>;

export interface ErrorStateProps extends ErrorStateVariants {
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
  variant?: ErrorStateVariants['variant'];
}

/* 28rem: a measure, not a spacing step — the scale has nothing for it. */
const DESCRIPTION = 'm-0 text-muted-foreground leading-copy max-w-[28rem]';

const ACTIONS = 'flex items-center gap-4 mt-2';

/** Centered state block: title, muted explanation, actions. */
export function ErrorState({
  title,
  description,
  children,
  className,
  variant = 'error',
}: ErrorStateProps) {
  const titleClassName = errorStateTitleVariants({ variant });

  return (
    <div className={cn(errorStateVariants({ variant }), className)}>
      {variant === 'error' ? (
        <h1 className={titleClassName}>{title}</h1>
      ) : (
        <p className={titleClassName}>{title}</p>
      )}
      {description ? <p className={DESCRIPTION}>{description}</p> : null}
      {children ? <div className={ACTIONS}>{children}</div> : null}
    </div>
  );
}
