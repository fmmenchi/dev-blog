import { visit } from 'unist-util-visit';

import { colorReplacements } from './shiki-theme.mjs';

/**
 * Highlight fenced code with Shiki, at build time — static HTML, no client JS.
 *
 * We call `highlighter.codeToHast` ourselves rather than use `@shikijs/rehype`: that
 * wrapper does not apply a raw theme's `tokenColors` (only its default foreground), so
 * every token came out one colour. `codeToHast` with the same theme colours correctly.
 * The highlighter is created once, in vite.config, and passed in — a rehype plugin
 * factory is called synchronously, so it cannot create one itself.
 *
 * The colours map to design tokens (see shiki-theme.mjs), so the code follows the accent
 * switch like everything else on the page.
 */
export function rehypeShiki(highlighter) {
  const langs = new Set(highlighter.getLoadedLanguages());

  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === null) return;

      const code = node.children[0];
      if (!code || code.tagName !== 'code') return;

      const className = code.properties?.className ?? [];
      const lang = (
        [].concat(className).find((c) => c.startsWith('language-')) ?? ''
      ).replace('language-', '');
      if (!langs.has(lang)) return;

      const value = code.children[0]?.value ?? '';
      const hast = highlighter.codeToHast(value, {
        lang,
        theme: 'dev-blog',
        colorReplacements,
      });

      /* codeToHast returns a root wrapping the <pre>; swap our <pre> for Shiki's. */
      parent.children[index] = hast.children[0];
    });
  };
}
