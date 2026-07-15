/*
 * Build gate: every mermaid diagram in a PUBLISHED post has a committed SVG.
 *
 * The diagrams are rendered by `nx run blog:diagrams` (which needs a browser) and the SVG
 * is committed; the build only inlines it. So a ```mermaid block added without re-running
 * that step would ship the "not rendered yet" placeholder to real visitors. This catches
 * it — the same guard check-og is for OG cards. It never renders, so it stays browser-free
 * and runs on every build. Drafts are not checked: they do not ship, and a missing draft
 * diagram is just a dev-time placeholder.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS = 'apps/blog/content/posts';
const DIAGRAMS = 'apps/blog/app/diagrams';

const hash = (source) =>
  createHash('sha256').update(source.trim()).digest('hex').slice(0, 12);

const wanted = new Set();
for (const file of readdirSync(POSTS).filter((f) => f.endsWith('.mdx'))) {
  const mdx = readFileSync(join(POSTS, file), 'utf8');
  for (const [, source] of mdx.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
    wanted.add(hash(source));
  }
}

const have = new Set(
  existsSync(DIAGRAMS)
    ? readdirSync(DIAGRAMS)
        .filter((f) => f.endsWith('.svg'))
        .map((f) => f.replace(/\.svg$/, ''))
    : [],
);

const missing = [...wanted].filter((h) => !have.has(h));
const orphan = [...have].filter((h) => !wanted.has(h));

if (missing.length > 0 || orphan.length > 0) {
  if (missing.length > 0) {
    console.error(
      `check-diagrams: ${missing.length} diagram(s) not rendered — run \`nx run blog:diagrams\` and commit:`,
    );
    for (const h of missing) console.error(`  ✖ ${h}`);
  }
  if (orphan.length > 0) {
    console.error(
      `check-diagrams: ${orphan.length} orphan SVG(s) — \`nx run blog:diagrams\` prunes them:`,
    );
    for (const h of orphan) console.error(`  ✖ ${h}.svg`);
  }
  process.exit(1);
}

console.log(`check-diagrams: ${wanted.size} diagram(s), all rendered ✓`);
