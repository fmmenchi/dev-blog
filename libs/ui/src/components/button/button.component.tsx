import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../internal/cn';

/*
 * Every class below resolves to a SEMANTIC token through the Tailwind bridge:
 * `bg-primary` is `--color-primary`, `bg-muted` is `--color-muted`. No palette,
 * no literal colour.
 *
 * `hover:not-disabled:` — not `enabled:hover:`. Through Slot the element may be
 * an <a>, and `:enabled` never matches an anchor: the hover state would silently
 * vanish on exactly the links that look like buttons.
 */
export const buttonVariants = cva(
  'inline-flex items-center gap-2 py-2 px-4 border border-transparent ' +
    'rounded-md font-sans text-base font-medium leading-normal ' +
    /* Slotted onto an <a>, it would otherwise underline itself. */
    'no-underline cursor-pointer [transition:var(--transition-color)] ' +
    'disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground ' +
          'hover:not-disabled:bg-primary-hover active:not-disabled:bg-primary-active',
        ghost:
          'bg-transparent text-foreground border-border ' +
          'hover:not-disabled:bg-muted',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  /**
   * Render the child instead of a `<button>`, keeping the button's looks.
   *
   * An action that navigates must stay a link — it needs middle-click, "open in
   * a new tab" and the link role — so a `mailto:` is written as
   * `<Button asChild><Link href="mailto:…">Say hi</Link></Button>`. Radix's Slot
   * merges the classes onto that child. It replaces an `href` prop that
   * reimplemented, worse, exactly this.
   */
  asChild?: boolean;
}

/**
 * Icon-only usage requires an `aria-label` (or `aria-labelledby`): the button
 * must always have an accessible name.
 */
export function Button({
  variant,
  className,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      /* A <button> defaults to type="submit". A slotted <a> must get no type. */
      {...(asChild ? {} : { type: type ?? 'button' })}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
