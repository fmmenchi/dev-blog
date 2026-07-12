# Images — agent rules

## One pipeline: build time

Images are committed to the repo and transformed at build by **`vite-imagetools`**
(sharp runs once; the output is hashed, immutable and first-party). There is no
runtime resize route and no CDN — the blog has no user uploads and no CMS. Do not
add one "just in case".

```ts
import avatar1x from '../images/fabio.jpg?w=72&format=webp&quality=90';
import avatar2x from '../images/fabio.jpg?w=144&format=webp&quality=90';
```

## Two components, and the boundary between them matters

- **`<Picture>`** (`libs/ui`) — the primitive. Takes plain `srcset` strings and
  knows nothing about where they came from. Renders `<picture>` + `<img>` with
  intrinsic `width`/`height` (so nothing reflows), lazy + async by default.
- **`<Image>`** (`apps/blog/app/components/image.tsx`) — the adapter. It is the
  only place that knows the shape of a `?as=picture` import.

Keep that boundary. It is why swapping the pipeline later would touch one file
instead of every component.

## Rules

- **`alt` is required.** Empty string ONLY for a decorative image whose meaning
  is already in the adjacent text — the avatar is the example: it is
  `aria-hidden` with `alt=""`, because the name is written right beside it
  (WCAG 1.1.1).
- **Always pass intrinsic `width`/`height`.** Without them the page reflows when
  the image lands (CLS).
- **Density (`1x`/`2x`) for a fixed-size image** like the avatar; **widths +
  `sizes`** for one that scales with the layout. A `w`-descriptor srcset with no
  `sizes` makes the browser assume `100vw` and fetch the largest variant.
- **`priority` only for the LCP image.** Everything else is lazy.
- **`as=picture` / `as=srcset` must be LAST in the query** — `app/images.d.ts`
  matches on the specifier's ending. Anywhere else and the import is typed `any`,
  silently.
- The source file must be **big enough for the 2x variant**. Upscaling is not a
  transform, it is a blur.

## Known gap

There is **no `og:image`**, so every link to the blog previews as bare text. See
[`.agent/seo.md`](./seo.md).
