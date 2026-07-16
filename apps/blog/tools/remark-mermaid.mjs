import { visit } from 'unist-util-visit';

import { hashDiagram } from './mermaid-theme.mjs';

/**
 * Turn a ```mermaid fenced block into `<MermaidDiagram hash="…" />`.
 *
 * It does NOT render anything — rendering needs a browser and happens once, locally, in
 * nx run blog:diagrams, which writes a themed SVG named by the same content hash. This
 * plugin only points at that SVG, so the build (and the dev server) stay browser-free.
 * The component inlines the SVG; if it is missing, it says which command to run.
 */
export function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || index === null) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'MermaidDiagram',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'hash',
            value: hashDiagram(node.value),
          },
        ],
        children: [],
      };
    });
  };
}
