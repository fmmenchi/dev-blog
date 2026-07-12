import { cn } from '../../internal/cn';

export interface PictureSource {
  /** MIME type, e.g. `image/avif`. */
  type: string;
  /** A complete `srcset` string for this format. */
  srcSet: string;
}

export interface PictureProps {
  /** Required. An empty string ONLY for a purely decorative image (WCAG 1.1.1). */
  alt: string;
  className?: string;
  /** Intrinsic height. Reserves the layout box, so the image cannot shift the page (CLS 0). */
  height: number;
  /** Intrinsic width. Same reason. */
  width: number;
  /** `true` for the LCP image only: eager, high priority, decoded synchronously. */
  priority?: boolean;
  /** Layout slot, e.g. `(min-width: 56rem) 300px, 100vw`. */
  sizes?: string;
  /** Modern formats, in preference order (avif before webp). */
  sources?: PictureSource[];
  /** Fallback `<img>` src — the largest variant of the fallback format. */
  src: string;
}

/**
 * Responsive-image primitive: a `<picture>` that negotiates modern formats and
 * falls back to `<img>`, with intrinsic dimensions so nothing reflows when it
 * lands, and lazy + async decoding unless it is the LCP image.
 *
 * Deliberately pipeline-agnostic — it takes plain `srcset` strings and does not
 * know or care whether they came from a build-time transform or a resize route.
 * That mapping belongs to the app (`app/components/image.tsx`), not to the
 * design system. See `.agent/assets.md`.
 */
export function Picture({
  alt,
  className,
  height,
  width,
  priority = false,
  sizes,
  sources = [],
  src,
}: PictureProps) {
  return (
    <picture>
      {sources.map((source) => (
        <source
          key={source.type}
          sizes={sizes}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <img
        alt={alt}
        className={cn('max-w-full', className)}
        decoding={priority ? 'auto' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        src={src}
        width={width}
      />
    </picture>
  );
}
