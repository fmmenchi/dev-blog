/*
 * Build gate: every generated icon must paint with `currentColor`.
 *
 * Why a gate and not a code review: `libs/icons/src` is generated and git-ignored,
 * so nobody ever reads it in a diff. That is exactly how two black-on-black icons
 * shipped — GitHub and LinkedIn arrive from simple-icons as a bare `<path d="…">`
 * with no `fill`, SVG defaults that to black, and on a dark background a black icon
 * is not a wrong colour, it is an invisible one. Nothing failed. It just vanished.
 *
 * So the guarantee lives here: an icon that hardcodes a colour, or that never says
 * what colour it is, fails the build instead of disappearing.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../libs/icons/src/', import.meta.url).pathname;

/* Any literal colour: hex, rgb()/hsl(), or a CSS named colour we care about. */
const HARDCODED = /(#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|"black"|"white")/gi;

const icons = readdirSync(dir).filter(
  (f) => f.endsWith('.tsx') && !f.endsWith('.spec.tsx'),
);

if (icons.length === 0) {
  console.error('check-icons: no icons found — did `generate` run?');
  process.exit(1);
}

const problems = [];

for (const file of icons) {
  const source = readFileSync(join(dir, file), 'utf8');

  const hardcoded = source.match(HARDCODED);
  if (hardcoded) {
    problems.push(
      `${file}: hardcodes ${[...new Set(hardcoded)].join(', ')} — it cannot follow the accent.`,
    );
  }

  /* Filled or stroked, an icon has to take its colour from the text around it. */
  if (!source.includes('currentColor')) {
    problems.push(
      `${file}: never sets currentColor — it will paint SVG's default black, ` +
        `which is invisible on our background. Fix the svgr config, not the .svg.`,
    );
  }
}

if (problems.length > 0) {
  console.error(`check-icons: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ✖ ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`check-icons: ${icons.length} icons, all currentColor ✓`);
