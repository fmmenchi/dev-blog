import type { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { createProjectGraphAsync } from '@nx/devkit';
import { createLockFile, createPackageJson, getLockFileName } from '@nx/js';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { TrivyExecutorSchema } from './schema';

/** Pinned: a scan whose tool changes underneath you is not a baseline. */
const IMAGE = 'aquasec/trivy:0.72.0';

/** Trivy's vulnerability DB. Without a cache, every run re-downloads it. */
const CACHE_VOLUME = 'dev-blog-trivy-cache';

const has = (command: string) =>
  spawnSync('command', ['-v', command], { shell: true, stdio: 'ignore' })
    .status === 0;

const dockerIsRunning = () =>
  spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;

/**
 * Rebuilds what an app actually SHIPS, and scans that.
 *
 * The workspace lockfile is not an answer to "is my app vulnerable" — it is the whole
 * toolbox: Playwright, Vitest, ESLint, unlighthouse, the plugin generator. Scanning it
 * assesses the tools. The deployed Worker contains React, React Router, marked, isbot
 * and nothing else.
 *
 * So the project graph is asked what the app depends on in production, and Nx's own
 * primitives write a package.json and a PRUNED lockfile for exactly that — the same
 * ones `generatePackageJson` uses. Trivy then scans that, and the answer is about the
 * app.
 */
async function pruneToApp(project: string, root: string) {
  const graph = await createProjectGraphAsync();

  const packageJson = createPackageJson(project, graph, {
    root,
    isProduction: true,
  });

  /*
   * Nx derives graph edges from IMPORTS, and `apps/blog/vite.config.ts` imports
   * @cloudflare/vite-plugin — so wrangler and the plugin arrive in the "production"
   * tree even though the app's own manifest declares them as devDependencies. The edge
   * is real; it is just a build-time one, and the graph has no way to know.
   *
   * The manifest does know. Anything the app itself calls a devDependency is not
   * something it ships, so it comes back out.
   */
  const projectRoot = graph.nodes[project]?.data.root;
  const manifest = projectRoot
    ? JSON.parse(readFileSync(join(root, projectRoot, 'package.json'), 'utf8'))
    : {};

  for (const name of Object.keys(manifest.devDependencies ?? {})) {
    delete packageJson.dependencies?.[name];
  }

  const lockFile = createLockFile(packageJson, graph, 'pnpm');

  const dir = mkdtempSync(join(tmpdir(), `trivy-${project}-`));
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  );
  writeFileSync(join(dir, getLockFileName('pnpm')), lockFile);

  return dir;
}

/**
 * Scans with Trivy: known vulnerabilities, and committed secrets.
 *
 * The SECRET scanner earns its keep because this repository is PUBLIC. A vulnerable
 * dependency costs an afternoon; a committed token costs the Cloudflare account. It
 * always runs against the real tree — a secret is a secret wherever it is.
 *
 * The VULNERABILITY scan, given `project`, runs against that app's production
 * dependency tree instead of the workspace lockfile. See `pruneToApp`.
 *
 * Trivy cannot be a dependency here — it is a Go binary, not an npm package. So the
 * executor uses whichever way of running it the machine already has: the binary if it
 * is on PATH (fastest), Docker otherwise (nothing to install). With neither, it says
 * so and says how to fix it, instead of dying with a `spawn trivy ENOENT`.
 */
const runExecutor: PromiseExecutor<TrivyExecutorSchema> = async (
  options,
  context: ExecutorContext,
) => {
  const {
    scanners = ['vuln', 'secret'],
    severity = ['HIGH', 'CRITICAL'],
    ignoreUnfixed = true,
    includeDevDeps = true,
    skipDirs = ['node_modules', 'dist', 'build', '.nx', '.unlighthouse'],
    runner = 'auto',
    project,
  } = options;

  const root = context.root;

  /* When an app is named, the vulnerability scan looks at what that app SHIPS. */
  const target = project ? await pruneToApp(project, root) : root;

  if (project) {
    console.log(
      `Scanning what "${project}" ships — its production dependency tree, not the workspace toolbox.\n`,
    );
  }

  const args = [
    'fs',
    '--scanners',
    scanners.join(','),
    '--severity',
    severity.join(','),
    ...skipDirs.flatMap((dir) => ['--skip-dirs', dir]),
    /* Anything at or above `severity` fails the task. That is the entire point. */
    '--exit-code',
    '1',
    '--no-progress',
    ...(ignoreUnfixed ? ['--ignore-unfixed'] : []),
    /*
     * Trivy SUPPRESSES devDependencies by default. That default is right for a pruned
     * app tree (there are none) and wrong for the workspace, where the runtime deps are
     * React and React Router and everything else — every tool that builds, tests and
     * lints the site — is a devDependency. Left out, a workspace scan would look at
     * almost nothing and report a confident zero.
     */
    ...(includeDevDeps ? ['--include-dev-deps'] : []),
  ];

  let command: string;
  let commandArgs: string[];

  const useBinary = runner !== 'docker' && has('trivy');
  const useDocker =
    runner !== 'binary' && !useBinary && has('docker') && dockerIsRunning();

  if (useBinary) {
    command = 'trivy';
    commandArgs = [...args, target];
  } else if (useDocker) {
    /*
     * CI forces this (`runner: docker`). A scan is a BASELINE, and a baseline that
     * depends on whichever trivy a runner image happens to ship is not one: the same
     * commit would pass today and fail next month for no reason of ours.
     */
    console.log(`Running ${IMAGE} through Docker.\n`);
    command = 'docker';
    commandArgs = [
      'run',
      '--rm',
      '-v',
      `${target}:/repo`,
      /* A named volume, not a bind mount: the DB survives between runs and belongs to
         Docker rather than to the repository. */
      '-v',
      `${CACHE_VOLUME}:/root/.cache/trivy`,
      '-w',
      '/repo',
      IMAGE,
      ...args,
      '/repo',
    ];
  } else {
    console.error(
      [
        '',
        'Trivy is not available, and neither is Docker.',
        '',
        'Trivy is a Go binary, not an npm package, so it cannot be a dependency of this',
        'workspace. Give the executor one of the two:',
        '',
        '  brew install trivy     # fastest: no container',
        '  …or start Docker, and this pulls the image itself',
        '',
      ].join('\n'),
    );
    return { success: false };
  }

  try {
    const { status } = spawnSync(command, commandArgs, { stdio: 'inherit' });
    return { success: status === 0 };
  } finally {
    if (project) rmSync(target, { force: true, recursive: true });
  }
};

export default runExecutor;
