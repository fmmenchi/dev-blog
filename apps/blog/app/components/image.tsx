import { Picture } from '@dev-blog/ui';

/**
 * App-level adapter over the pure `<Picture>` primitive.
 *
 * It knows the shape of the build pipeline — the object a `vite-imagetools`
 * `?as=picture` import produces — which the design system must not. Keeping that
 * knowledge here is what lets `Picture` stay pipeline-agnostic: a runtime resize
 * route could feed it tomorrow without touching a single component.
 */
export interface PictureImport {
  img: { src: string; w: number; h: number };
  /** Format name (`avif`, `webp`, `jpeg`…) → its srcset string. */
  sources: Record<string, string>;
}

export interface ImageProps {
  image: PictureImport;
  /** Required. Empty string ONLY when the image is purely decorative. */
  alt: string;
  /** Layout slot, e.g. `(min-width: 56rem) 300px, 100vw`. */
  sizes?: string;
  /** `true` for the LCP image only. */
  priority?: boolean;
  className?: string;
}

export function Image({
  alt,
  className,
  image,
  priority = false,
  sizes,
}: ImageProps) {
  return (
    <Picture
      alt={alt}
      className={className}
      height={image.img.h}
      priority={priority}
      sizes={sizes}
      sources={Object.entries(image.sources).map(([format, srcSet]) => ({
        srcSet,
        type: `image/${format}`,
      }))}
      src={image.img.src}
      width={image.img.w}
    />
  );
}
