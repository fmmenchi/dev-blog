/// <reference types='vitest' />
import { execFileSync } from 'node:child_process';
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeSlug from 'rehype-slug';

import { remarkMermaid } from './tools/remark-mermaid.mjs';
import { remarkToc } from './tools/remark-toc.mjs';

/**
 * Close the server on SIGTERM/SIGHUP instead of dying where we stand.
 *
 * The Cloudflare plugin runs the worker in `workerd`, a CHILD PROCESS that
 * miniflare only kills when the server is closed properly. Ctrl-C already did
 * the right thing (SIGINT is handled upstream), but a SIGTERM — an editor
 * stopping the task, a script, an agent, `nx` being killed — hits Node with no
 * handler installed, and Node's default action for SIGTERM is to terminate
 * *immediately*: no plugin teardown, no miniflare dispose, and `workerd`
 * outlives its parent. Every such stop leaked one. We found ten of them, up to
 * three and a half hours old, sitting on 64 MB and — before the ports were
 * freed — on 4200 and 9229.
 *
 * Installing a handler overrides that default: we close the server (which runs
 * the plugin teardown that reaps workerd) and only then exit.
 */
function reapWorkerdOnSignals(): Plugin {
  const closeOn = (server: { close: () => Promise<void> }) => {
    const shutdown = () => {
      void server
        .close()
        .catch(() => undefined)
        .finally(() => process.exit(0));
    };

    /* `once`: a second signal must kill us outright, not queue a second close. */
    process.once('SIGTERM', shutdown);
    process.once('SIGHUP', shutdown);
  };

  return {
    name: 'dev-blog:reap-workerd-on-signals',
    configureServer(server: ViteDevServer) {
      closeOn(server);
    },
    configurePreviewServer(server) {
      closeOn(server);
    },
  };
}

/**
 * Build identity, resolved once and inlined by `define` below.
 *
 * The version is the git TAG, never `package.json`: `nx release` here tags but does
 * not commit the bump (`nx.json` → `release.git.commit: false`), so every
 * `package.json` in the workspace sits at 0.0.0 forever while the tags are at
 * v0.20.x. Reading the file would print a version that has never existed.
 *
 * CI passes both values as env vars — the deploy job is the only place that knows
 * WHICH tag was just cut — and `nx.json` lists them under `sharedGlobals`, so a build
 * made without them is not a cache hit for a build made with them. Without that, the
 * deploy would restore the artifact the CI build had already cached, with the previous
 * release baked into it.
 *
 * Outside CI we ask git, which is why the dev server shows a real version too. `dev`
 * is only for the case where there is no git at all (a tarball, a container).
 */
function git(...args: string[]): string {
  try {
    return execFileSync('git', args, {
      cwd: import.meta.dirname,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    /* No repo, no tags, no git binary. Not an error: the build carries on. */
    return '';
  }
}

const VERSION =
  process.env['APP_VERSION'] ||
  git('describe', '--tags', '--abbrev=0', '--match', 'v*').replace(/^v/, '') ||
  'dev';

const COMMIT = process.env['GIT_HASH'] || git('rev-parse', '--short', 'HEAD');

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/blog',
  /*
   * Textual substitution, so `getBuildInfo()` is the same constant on the server and in
   * the browser: no loader, no `window.ENV`, nothing to hydrate.
   */
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(VERSION),
    'import.meta.env.VITE_GIT_HASH': JSON.stringify(COMMIT),
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [
    reapWorkerdOnSignals(),
    tailwindcss(),
    /*
     * Posts compile to React components at BUILD time. That is what lets a post use
     * <Image> and our <Link> — a component cannot be rendered from a string of HTML,
     * which is what marked produced and dangerouslySetInnerHTML injected. It also means
     * no markdown parser ships at runtime: `marked` leaves the bundle entirely.
     *
     * `enforce: 'pre'` so .mdx becomes JSX before the React plugin looks at it.
     */
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
          remarkToc,
          /* ```mermaid → <MermaidDiagram hash>, pointing at a pre-rendered themed SVG.
             No browser here: rendering is nx run blog:diagrams. */
          remarkMermaid,
        ],
        /* The same ids the table of contents links to. */
        rehypePlugins: [rehypeSlug],
        providerImportSource: '@mdx-js/react',
      }),
    },
    // Build-time image transforms: sharp runs once, output is hashed and
    // immutable and first-party. See .agent/assets.md.
    imagetools(),
    // The Cloudflare plugin must not load while Nx builds its project graph
    // (Nx evaluates this config without the react-router CLI orchestration,
    // which trips the plugin's environment validation).
    !process.env.VITEST &&
      !(globalThis as Record<string, unknown>)['NX_GRAPH_CREATION'] &&
      cloudflare({
        viteEnvironment: { name: 'ssr' },
        /*
         * workerd's inspector binds a FIXED port (9229, then 9230…), so two
         * preview servers cannot coexist however careful you are with the HTTP
         * port — and this repo is developed in git worktrees, where two e2e runs
         * at once is normal. The loser died with EADDRINUSE, which read as "the
         * tests are broken" rather than "two debuggers wanted the same socket".
         * The suite never debugs the worker, so the e2e run switches it off.
         */
        inspectorPort: process.env['E2E'] === '1' ? false : undefined,
      }),
    !process.env.VITEST && reactRouter(),
  ],
  /*
   * Source maps for the WORKER ONLY — never for the client.
   *
   * `wrangler.jsonc` has had `upload_source_maps: true` and `observability` on from the
   * start, but nothing ever emitted a map, so the flag uploaded nothing. Note what this
   * does and does not buy: vite does NOT minify an SSR build, so the worker was never
   * unreadable — a stack trace just pointed INTO THE BUNDLE, `server-build-<hash>.js`
   * at line 10924 of 572 kB. The map is what turns that back into `app/routes/about.tsx`
   * at line 36.
   *
   * It has to be scoped to the `ssr` environment (the one the Cloudflare plugin bundles
   * into the Worker). A plain top-level `build.sourcemap` would also emit maps for the
   * client — and THAT bundle is minified, and its maps land in `build/client/assets/`,
   * i.e. they ship as public static assets. Wrangler instead uploads the server map
   * privately, to Cloudflare, where only observability reads it.
   *
   * Turning this on makes rolldown warn SOURCEMAP_BROKEN for `vite:css-post`, which
   * rewrites the three CSS imports into JS stubs without emitting a map of its own. It
   * is confined to those stubs: every app source in the map resolves to the exact
   * original file, line and column. Nothing throws from inside a CSS stub.
   */
  environments: {
    ssr: {
      build: {
        sourcemap: true,
      },
    },
  },
  build: {
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'blog',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{app,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
