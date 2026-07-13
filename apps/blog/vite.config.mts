/// <reference types='vitest' />
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

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

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/blog',
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
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
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
