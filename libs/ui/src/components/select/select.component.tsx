import * as RadixSelect from '@radix-ui/react-select';

import { cn } from '../../internal/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Required: a control with no name is a control nobody can use (WCAG 4.1.2). */
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

/**
 * A small select, for choosing an order.
 *
 * On Radix: the listbox roles, the typeahead, the arrow-key navigation and the
 * focus trap are its job, not ours. A hand-rolled dropdown is the single most
 * common way a site becomes unusable by keyboard.
 *
 * Drive it from the URL, not from local state, so the choice is shareable and
 * survives a refresh.
 */
export function Select({
  label,
  value,
  onValueChange,
  options,
  className,
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        aria-label={label}
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-2.5 py-1.5',
          'font-mono text-xs text-muted-foreground [transition:var(--transition-color)]',
          'hover:border-primary hover:text-foreground',
          className,
        )}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon aria-hidden="true">↓</RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 overflow-hidden rounded-md border border-border bg-card p-1 font-mono text-xs text-card-foreground"
        >
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={cn(
                  'flex cursor-pointer items-center rounded-sm px-2 py-1.5 outline-none select-none',
                  'data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
                  /* Not colour alone: the chosen one is also marked with a glyph. */
                  'data-[state=checked]:font-semibold data-[state=checked]:text-primary',
                )}
              >
                <RadixSelect.ItemIndicator
                  aria-hidden="true"
                  className="mr-1.5"
                >
                  ✓
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
