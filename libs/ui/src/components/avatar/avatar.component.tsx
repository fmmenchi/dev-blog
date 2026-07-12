import * as RadixAvatar from '@radix-ui/react-avatar';

import { cn } from '../../internal/cn';

export interface AvatarProps {
  /** Used for the initial, and as the image's alt text when `src` is given. */
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

/**
 * Initial-letter avatar, on Radix's primitive so an image can drop in later
 * without rewriting anything: Radix keeps the fallback visible until the image
 * has actually loaded, instead of flashing a broken frame.
 *
 * `aria-hidden`: the adjacent text always carries the name, so announcing "F"
 * again would be noise (WCAG 1.1.1 — decorative content gets no name).
 */
export function Avatar({ name, src, size = 60, className }: AvatarProps) {
  return (
    <RadixAvatar.Root
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary align-middle',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <RadixAvatar.Image
          src={src}
          alt=""
          className="size-full object-cover"
        />
      ) : null}
      <RadixAvatar.Fallback
        className="flex size-full items-center justify-center font-bold text-primary-foreground"
        style={{ fontSize: size * 0.42 }}
      >
        {name.charAt(0)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
