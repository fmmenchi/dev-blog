/*
 * `pnpm nx assess blog` — serve the production build, sweep it with Unlighthouse,
 * shut the server down again.
 *
 * The sweep runs against `blog:preview` (miniflare/workerd — the runtime Cloudflare
 * actually runs), not the dev server: a Lighthouse score taken from an unminified,
 * unbundled dev build measures a site nobody visits.
 *
 * The server is started HERE rather than left to the caller so the target is one
 * command and cannot leave a stray process holding the port.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const SITE = 'http://localhost:4300';
const BOOT_TIMEOUT_MS = 120_000;

/** Resolves once the preview server answers, or rejects if it never does. */
async function waitForServer(deadline) {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(SITE, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) return;
    } catch {
      /* Not up yet — that is the normal case for the first few seconds. */
    }
    await sleep(500);
  }
  throw new Error(`preview server did not answer on ${SITE} in time`);
}

const server = spawn('pnpm', ['exec', 'nx', 'run', 'blog:preview'], {
  stdio: 'ignore',
  /* Its own process group, so the signal below reaches pnpm and nx together. */
  detached: true,
});

/*
 * Never leave the port held, whatever happens below.
 *
 * SIGTERM, not SIGKILL: nx starts `vite preview` in a process group of ITS own, so a
 * signal to our group never reaches the process that holds the port. Killed outright,
 * nx cannot pass anything on and the server lives on as an orphan — every run left one
 * behind, and the next run then timed out waiting on a port answering 500. Asked to
 * terminate, nx stops its child before it goes.
 */
const stopServer = () => {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* Already gone. */
  }
};
process.on('exit', stopServer);
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));

try {
  await waitForServer(Date.now() + BOOT_TIMEOUT_MS);
} catch (error) {
  console.error(`assess: ${error.message}`);
  process.exit(1);
}

const scan = spawn(
  'pnpm',
  ['exec', 'unlighthouse-ci', '--site', SITE, '--build-static'],
  { stdio: 'inherit' },
);

scan.on('exit', (code) => {
  console.log(`\nassess: report written to .unlighthouse/`);
  process.exit(code ?? 1);
});
