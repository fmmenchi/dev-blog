#!/usr/bin/env node
/**
 * Fails the build on a `var(--token)` that the theme does not define.
 *
 * CSS does not warn about this. An undefined custom property makes the whole
 * declaration invalid at computed-value time, so it is not "the colour is
 * wrong" — the declaration simply vanishes. It has bitten this repo three times:
 * an EmptyState that shipped with no padding at all, and an accent swatch that
 * went colourless when the token behind it was renamed. Neither had a failing
 * test, because there was nothing to fail.
 *
 * Tailwind's `@theme` bridge counts as a definition: a role reaching it becomes
 * a utility, which is the whole point of the bridge.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const THEME = join(ROOT, 'libs/theme/src/styles');
const SCANNED = ['libs/ui/src', 'apps/blog/app'];
const EXTENSIONS = new Set(['.css', '.ts', '.tsx']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (EXTENSIONS.has(extname(path))) out.push(path);
  }
  return out;
}

/** Everything the theme (and its Tailwind bridge) declares. */
const defined = new Set();
for (const file of walk(THEME)) {
  const css = readFileSync(file, 'utf8');
  for (const [, name] of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) {
    defined.add(name);
  }
}

/* Tailwind defines these itself. */
for (const own of ['--spacing', '--tw-leading', '--tw-font-weight']) {
  defined.add(own);
}

const problems = [];
for (const dir of SCANNED) {
  for (const file of walk(join(ROOT, dir))) {
    const source = readFileSync(file, 'utf8');
    for (const [, name] of source.matchAll(/var\((--[a-z0-9-]+)/g)) {
      if (!defined.has(name)) {
        problems.push(`${file.replace(ROOT, '')}: ${name}`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(
    `\n${problems.length} reference(s) to a token the theme does not define.\n` +
      `A var() with no definition deletes its entire declaration, silently:\n`,
  );
  for (const problem of [...new Set(problems)]) console.error(`  ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ every var(--token) resolves (${defined.size} defined)`);
