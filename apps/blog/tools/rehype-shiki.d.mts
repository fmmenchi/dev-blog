import type { HighlighterGeneric } from 'shiki';
import type { Plugin } from 'unified';

/**
 * A rehype plugin (factory) that highlights fenced code with the given Shiki highlighter.
 * Typed by hand, like the other JS plugins in this folder: it runs inside the vite config,
 * which Nx also evaluates while building its project graph, where a .ts file would need a
 * compile step that does not exist yet.
 */
export declare const rehypeShiki: Plugin<
  [HighlighterGeneric<string, string>],
  import('hast').Root
>;
