/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

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
    // The Cloudflare plugin must not load while Nx builds its project graph
    // (Nx evaluates this config without the react-router CLI orchestration,
    // which trips the plugin's environment validation).
    !process.env.VITEST &&
      !(globalThis as Record<string, unknown>)['NX_GRAPH_CREATION'] &&
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
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
