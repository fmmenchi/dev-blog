/*
 * Build gate: every post must have a social card.
 *
 * The cards are generated (tools/og-image.mjs) and committed, which means writing a
 * post and forgetting to run it produces a page whose og:image points at a 404. Nothing
 * breaks, nothing fails — the link just renders as a broken image in someone else's
 * feed, which is the one place you will never look.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = 'apps/blog/content/posts';
const CARDS_DIR = 'apps/blog/public/og';

const missing = readdirSync(POSTS_DIR)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''))
  .filter((slug) => !existsSync(join(CARDS_DIR, `${slug}.png`)));

if (!existsSync('apps/blog/public/og.png')) {
  console.error('check-og: the site card (public/og.png) is missing.');
  process.exit(1);
}

if (missing.length > 0) {
  console.error(`check-og: ${missing.length} post(s) with no social card\n`);
  for (const slug of missing)
    console.error(`  ✖ ${slug} — no public/og/${slug}.png`);
  console.error('\nRun `node tools/og-image.mjs` and commit the PNGs.\n');
  process.exit(1);
}

console.log('check-og: every post has a card ✓');
