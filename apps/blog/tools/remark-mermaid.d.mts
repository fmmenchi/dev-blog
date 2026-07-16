import type { Plugin } from 'unified';

/**
 * Rewrites a ```mermaid block to `<MermaidDiagram hash="…" />` at build time.
 *
 * Typed by hand for the same reason as remark-toc: the plugin is plain JS, because it runs
 * inside the vite config, which Nx also evaluates while building its project graph — where
 * a .ts file would need a compile step that does not exist yet.
 */
export declare const remarkMermaid: Plugin<[], import('mdast').Root>;
