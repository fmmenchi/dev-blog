import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '../../internal/cn';

export const toggleGroupItemVariants = cva(
  'inline-flex cursor-pointer items-center border border-border px-2 py-0.5 ' +
    'font-mono text-xs text-muted-foreground [transition:var(--transition-color)] ' +
    'hover:border-primary hover:text-foreground ' +
    /* The pressed state must not be colour alone (WCAG 1.4.1): the fill and the
       text weight change together, so it survives greyscale and colour-blindness. */
    'data-[state=on]:border-primary data-[state=on]:bg-primary ' +
    'data-[state=on]:font-semibold data-[state=on]:text-primary-foreground',
  {
    variants: {
      shape: {
        pill: 'rounded-full',
        tag: 'rounded-sm',
      },
    },
    defaultVariants: { shape: 'tag' },
  },
);

export type ToggleGroupItemVariants = VariantProps<
  typeof toggleGroupItemVariants
>;

export interface ToggleGroupProps {
  /** Required: the group needs a name of its own (WCAG 4.1.2). */
  label: string;
  /** The selected values. Drive it from the URL, not from component state. */
  value: string[];
  onValueChange: (value: string[]) => void;
  className?: string;
  children: ReactNode;
}

/**
 * A row of toggles — tag filters, mostly. Multi-select on purpose: filters
 * stack. If you ever need an either/or, add a `single` variant then, not now.
 *
 * On Radix, which brings the roles, the roving arrow-key focus and the pressed
 * state. Hand-rolling this is how you end up with a row of <div>s no keyboard
 * can reach.
 */
export function ToggleGroup({
  label,
  value,
  onValueChange,
  className,
  children,
}: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      type="multiple"
      value={value}
      onValueChange={onValueChange}
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {children}
    </RadixToggleGroup.Root>
  );
}

export interface ToggleGroupItemProps extends ToggleGroupItemVariants {
  value: string;
  className?: string;
  children: ReactNode;
}

export function ToggleGroupItem({
  value,
  shape,
  className,
  children,
}: ToggleGroupItemProps) {
  return (
    <RadixToggleGroup.Item
      value={value}
      className={cn(toggleGroupItemVariants({ shape }), className)}
    >
      {children}
    </RadixToggleGroup.Item>
  );
}
