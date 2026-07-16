import { Link } from '@dev-blog/ui';
import type { ComponentProps } from 'react';

import { Image } from './image';
import { MermaidDiagram } from './mermaid';

/**
 * What the elements of a post compile to.
 *
 * This map is the whole point of moving the posts to MDX. Before, a post was a string of
 * HTML, and a string has no idea our components exist — so every link in an article was a
 * raw `<a href>`, which **reloads the entire document** instead of routing, and every
 * image was a bare `<img>`: no srcset, no intrinsic size, nothing lazy.
 *
 * The design system already had the answers. The content just could not reach them.
 */
export const mdxComponents = {
  /**
   * Internal links route; external ones get `rel="noreferrer"` and the "(opens in a new
   * tab)" hint for screen readers. `Link` decides which is which from the href — the
   * same rule the rest of the site follows, now applied to prose as well.
   */
  a: ({ href = '', children, ...rest }: ComponentProps<'a'>) => (
    /* `href` is pulled out of the spread on purpose: LinkProps is a union — `to` OR
       `href`, never both — and a stray optional href from the anchor's own props
       satisfies neither side of it. */
    <Link href={href} {...rest}>
      {children}
    </Link>
  ),

  /**
   * Available BY NAME inside a post: `<Image image={…} alt="…" />`, with the image
   * imported at the top of the .mdx file so vite-imagetools can transform it.
   *
   * There is no mapping for markdown's `![alt](src)` on purpose. That syntax gives a
   * plain string, and a plain string cannot carry a srcset or an intrinsic size — it
   * would compile to exactly the `<img>` this replaced. An image worth putting in an
   * article is worth importing.
   */
  Image,

  /**
   * A ```mermaid block, compiled by remark-mermaid to `<MermaidDiagram hash>` and inlined
   * here from a pre-rendered, themed SVG. Diagrams follow the accent switch; the browser
   * that lays them out runs only in nx run blog:diagrams, never in the build.
   */
  MermaidDiagram,

  /**
   * A GFM table (remark-gfm turns `| … |` into real table nodes) gets a scroll container:
   * on a phone a wide table scrolls sideways inside its own box instead of forcing the
   * whole page to. The table's own look comes from `.body table` in post.module.css.
   */
  table: ({ children, ...rest }: ComponentProps<'table'>) => (
    <div className="max-w-full overflow-x-auto">
      <table {...rest}>{children}</table>
    </div>
  ),
};
