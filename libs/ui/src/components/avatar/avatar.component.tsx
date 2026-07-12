import * as RadixAvatar from '@radix-ui/react-avatar';

import { cn } from '../../internal/cn';

export interface AvatarProps {
  /** Used for the initial when there is no image. */
  name: string;
  /** Fallback `src`. Without it, the avatar is the initial. */
  src?: string;
  /** Density srcset (`… 1x, … 2x`) — a fixed-size image needs no `sizes`. */
  srcSet?: string;
  size?: number;
  className?: string;
}

/**
 * The initial, or a photo.
 *
 * On Radix's primitive so the fallback stays until the image has actually
 * decoded — instead of flashing an empty frame — and comes back if it fails.
 *
 * `aria-hidden`, and the `alt` is empty: the name is always written right beside
 * it, so announcing the photo (or the letter) again would be pure noise
 * (WCAG 1.1.1 — decorative content takes no accessible name).
 */
export function Avatar({
  name,
  src,
  srcSet,
  size = 60,
  className,
}: AvatarProps) {
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
          srcSet={srcSet}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : null}
      {/* delayMs 0: show the letter at once, Radix swaps the photo in when it decodes. */}
      <RadixAvatar.Fallback
        delayMs={0}
        className="flex size-full items-center justify-center font-bold text-primary-foreground"
        style={{ fontSize: size * 0.42 }}
      >
        {name.charAt(0)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
