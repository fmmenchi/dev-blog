/*
 * The avatar photo, transformed at build time by vite-imagetools.
 *
 * ONE variant, not a density srcset. The avatar is a fixed size (112px at its
 * largest), so a single image at 2x that size is sharp on every screen and costs
 * ~15 KB. A `1x/2x` srcset is the textbook answer, but Radix's Avatar preloads
 * with a bare `src`: the browser commits to that file and never upgrades, so the
 * srcset quietly bought nothing and served the 1x to retina screens anyway.
 * Measured, not assumed.
 *
 * For an image that SCALES with the layout, use `<Image>` with a width srcset and
 * `sizes`. See `.agent/assets.md`.
 */
import avatar from '../images/fabio.jpg?w=256&format=webp&quality=90&as=url';

export const avatarSrc: string = avatar;
