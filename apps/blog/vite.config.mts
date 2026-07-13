/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

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
