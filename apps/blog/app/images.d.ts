/**
 * Types for `vite-imagetools` imports.
 *
 * TypeScript allows exactly ONE `*` in a module declaration, so the pattern must
 * match the END of the specifier. That is why the `as=` directive is always
 * LAST in the query — put it anywhere else and the import silently has no type.
 */

/** `as=picture` — the object consumed by `<Image>`. */
declare module '*as=picture' {
  const image: {
    img: { src: string; w: number; h: number };
    sources: Record<string, string>;
  };
  export default image;
}

/** `as=srcset` — a plain srcset string. */
declare module '*as=srcset' {
  const srcset: string;
  export default srcset;
}

/** `as=url` — a single transformed file (imagetools' default, written explicitly). */
declare module '*as=url' {
  const src: string;
  export default src;
}
