import { createServer } from 'node:net';
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

/**
 * Ask the OS for a free port: bind to 0, read what we got, hand it back.
 *
 * A fixed port cannot work here, because this repo is developed in git
 * WORKTREES: two branches running e2e at the same time would fight over one
 * number, and the loser fails for no reason of its own. It also made a stale
 * server from another branch look like ours (see `webServer` below).
 */
function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, () => {
      const address = probe.address();
      if (address === null || typeof address === 'string') {
        probe.close();
        reject(new Error('no port'));
        return;
      }
      const { port } = address;
      probe.close(() => resolve(port));
    });
  });
}

/*
 * BASE_URL wins when set: pointing the suite at an already-running server (a
 * deploy preview, a server you are watching yourself) is worth keeping.
 */
const externalBaseURL = process.env['BASE_URL'];

/*
 * Playwright re-loads this config in EVERY worker process, so picking a port
 * here naively hands each worker a DIFFERENT one — they then knock on doors
 * where no server is listening. Stash it in the environment on the first pass:
 * workers inherit the env of the process that spawned them, so they all read
 * back the one port the server was actually started on.
 */
if (!externalBaseURL && !process.env['E2E_PORT']) {
  process.env['E2E_PORT'] = String(await freePort());
}

const port = Number(process.env['E2E_PORT'] ?? 0);
const baseURL = externalBaseURL ?? `http://localhost:${port}`;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: externalBaseURL
    ? undefined
    : {
        /*
         * Playwright starts this in its own process group and kills the group on
         * teardown — so the command must BE the server, not a launcher for it.
         * It used to be `pnpm exec nx run blog:preview`, and Nx runs the task
         * through its own runner: the signal reached Nx, the `vite` grandchild
         * survived, and every run left a preview server behind. Those orphans
         * held the port (which `reuseExistingServer` then adopted, so a run
         * could test ANOTHER branch's build and report green) and kept stdout
         * open, so the terminal hung long after the tests had finished.
         *
         * `--strictPort` matters: without it vite quietly slides to the next
         * free port when ours is taken, and Playwright waits out its timeout on
         * a URL where nobody is listening. Fail, don't drift.
         *
         * vite preview runs the worker in miniflare (workerd) — the same runtime
         * as the Cloudflare deployment. The build arrives through the e2e
         * target's `dependsOn`.
         */
        command: `pnpm exec vite preview --port ${port} --strictPort`,
        cwd: join(workspaceRoot, 'apps/blog'),
        url: baseURL,
        reuseExistingServer: false,
        /* Switches off workerd's fixed-port inspector — see `vite.config.mts`. */
        env: { E2E: '1' },
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
