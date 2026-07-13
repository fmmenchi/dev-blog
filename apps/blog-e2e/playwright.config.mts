import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// Dedicated port so local runs never collide with dev servers (4200/4201).
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    /*
     * Playwright starts this in its own process group and kills that group on
     * teardown — so the command must BE the server, not a launcher for it. It
     * used to be `pnpm exec nx run blog:preview`, and Nx runs the task through
     * its own runner: the signal reached Nx, the `vite` grandchild survived, and
     * every run left a preview server behind. Those orphans then (a) held port
     * 4300, which `reuseExistingServer` happily adopted — so a run could test
     * ANOTHER branch's build without saying so — and (b) kept stdout open, so
     * the terminal hung long after the tests had finished. Five of them were
     * alive, from three hours earlier, when we finally went looking.
     *
     * Hence: vite directly (the build comes from the target's dependsOn), and no
     * reuse. If 4300 is busy the run now FAILS instead of silently adopting a
     * stranger — a loud error beats a green test against the wrong bundle.
     *
     * vite preview runs the worker in miniflare (workerd) — the same runtime as
     * the Cloudflare deployment.
     */
    command: 'pnpm exec vite preview --port 4300',
    cwd: join(workspaceRoot, 'apps/blog'),
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
