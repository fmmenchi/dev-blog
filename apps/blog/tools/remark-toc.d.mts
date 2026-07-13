import type { Plugin } from 'unified';

/**
 * Collects a post's `##` headings into a `toc` export, at build time.
 *
 * Typed by hand because the plugin itself is plain JS: a remark plugin runs inside the
 * vite config, which Nx also evaluates while building its project graph — and a .ts file
 * there would need a compile step that does not exist at that moment.
 */
export declare const remarkToc: Plugin<[], import('mdast').Root>;
