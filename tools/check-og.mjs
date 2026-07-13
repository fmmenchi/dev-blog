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

const slugs = readdirSync(POSTS_DIR)
  .filter((file) => file.endsWith('.mdx'))
  .map((file) => file.replace(/\.mdx$/, ''));

/*
 * A gate that finds nothing to check must SCREAM, not pass.
 *
 * This one filtered for `.md` and the posts became `.mdx`. It went on printing "every post
 * has a card" while looking at an empty list — a green check that meant nothing, which is
 * worse than no check, because you believe it. Exactly the failure the article this gate
 * protects is about.
 */
if (slugs.length === 0) {
  console.error(
    `check-og: found NO posts in ${POSTS_DIR}. A gate with nothing to check is not passing, it is blind.`,
  );
  process.exit(1);
}

const missing = slugs.filter(
  (slug) => !existsSync(join(CARDS_DIR, `${slug}.png`)),
);

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
