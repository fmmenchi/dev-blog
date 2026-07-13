import { visit } from 'unist-util-visit';

/**
 * Collects the post's `##` headings into a `toc` export, at BUILD time.
 *
 * The old table of contents was scraped back out of the HTML string that `marked` had
 * produced — and since that string was already escaped, and React escaped it again on
 * the way to the page, a heading with an apostrophe arrived as `What doesn&#39;t`. The
 * fix was a decodeEntities() function, which is the sort of thing that exists only
 * because the data took a wrong shape three steps earlier.
 *
 * Here the headings come off the syntax tree, before anything has been turned into HTML
 * at all. There is nothing to escape and nothing to undo.
 *
 * The `id` must match what rehype-slug puts on the heading itself, or the anchors point
 * at nothing — so it is derived the same way: GitHub's slugger, which rehype-slug uses.
 */
export function remarkToc() {
  return (tree, file) => {
    const toc = [];

    visit(tree, 'heading', (node) => {
      if (node.depth !== 2) return;

      /* Plain text only: a heading with `code` or emphasis still has one title. */
      const text = node.children
        .filter((child) => 'value' in child)
        .map((child) => child.value)
        .join('')
        .trim();

      if (text) toc.push({ text, id: slugify(text) });
    });

    /* Exported from the module, so the route reads it as data rather than parsing. */
    file.data.toc = toc;

    tree.children.unshift({
      type: 'mdxjsEsm',
      value: `export const toc = ${JSON.stringify(toc)};`,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [],
              source: null,
              declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'toc' },
                    init: valueToEstree(toc),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}

/** GitHub's algorithm, the one rehype-slug implements. Kept in step deliberately. */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}

/** The toc is only strings — no need for a general JS-value-to-AST converter. */
function valueToEstree(entries) {
  return {
    type: 'ArrayExpression',
    elements: entries.map((entry) => ({
      type: 'ObjectExpression',
      properties: Object.entries(entry).map(([key, value]) => ({
        type: 'Property',
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        key: { type: 'Identifier', name: key },
        value: { type: 'Literal', value },
      })),
    })),
  };
}
