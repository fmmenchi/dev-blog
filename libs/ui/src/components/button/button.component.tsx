import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../internal/cn';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Icon-only usage requires an `aria-label` (or `aria-labelledby`): the button
 * must always have an accessible name.
 */
export function Button({
  variant = 'primary',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles['button'], styles[variant], className)}
      {...props}
    />
  );
}
