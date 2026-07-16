/*
 * Render every mermaid diagram in the posts to a themed SVG, committed under
 * apps/blog/app/diagrams/. Runs LOCALLY (nx run blog:diagrams) — it needs a browser to
 * lay mermaid out, and borrows the Chromium Playwright already ships for e2e. The build
 * never renders: it inlines these committed SVGs. Re-run it whenever you add or change a
 * diagram; an edit changes the content hash, so the old SVG is pruned and a new one cut.
 */
import { createRequire } from 'node:module';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

import {
  accentClassDef,
  hashDiagram,
  mermaidConfig,
  recolour,
} from './mermaid-theme.mjs';

const require = createRequire(import.meta.url);
const mermaidJs = readFileSync(
  require
    .resolve('mermaid/package.json', { paths: ['apps/blog', '.'] })
    .replace(/package\.json$/, 'dist/mermaid.min.js'),
  'utf8',
);

/*
 * Two buckets, so a draft's diagrams stay out of the production bundle exactly like its
 * prose does: published SVGs live in app/diagrams (always bundled), draft SVGs in
 * app/diagrams-draft (bundled only on the dev server — see the MODE gate in mermaid.tsx).
 */
const BUCKETS = [
  { dir: 'apps/blog/content/posts', out: 'apps/blog/app/diagrams' },
  { dir: 'apps/blog/content/drafts', out: 'apps/blog/app/diagrams-draft' },
];

/** Pull every ```mermaid block out of the .mdx files in one bucket. */
function collectDiagrams(dir) {
  const found = new Map(); // hash -> source
  if (!existsSync(dir)) return found;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const mdx = readFileSync(join(dir, file), 'utf8');
    for (const [, source] of mdx.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
      found.set(hashDiagram(source), source.trim());
    }
  }
  return found;
}

async function render(sources) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<div></div>');
  await page.addScriptTag({ content: mermaidJs });

  const out = new Map();
  for (const [hash, source] of sources) {
    const svg = await page.evaluate(
      async ({ source, config, accentClassDef }) => {
        // @ts-expect-error injected global
        mermaid.initialize(config);
        // @ts-expect-error injected global
        const { svg } = await mermaid.render(
          'm' + Math.abs([...source].reduce((a, c) => a + c.charCodeAt(0), 0)),
          `${source}\n${accentClassDef}`,
        );
        return svg;
      },
      { source, config: mermaidConfig, accentClassDef },
    );
    out.set(hash, recolour(svg));
  }
  await browser.close();
  return out;
}

let referenced = 0;
let renderedCount = 0;
let pruned = 0;

/*
 * Every run renders every diagram from scratch, rather than skipping the ones already on
 * disk. The hash keys on the diagram's SOURCE, not the theme — so skipping would silently
 * ignore a change to mermaid-theme.mjs. Nx already caches this target on the content and
 * the theme files (see package.json inputs), so an unchanged workspace never re-runs it;
 * when it does run, it is because something a diagram depends on moved, and then all of
 * them are re-rendered honestly.
 */
for (const { dir, out } of BUCKETS) {
  const wanted = collectDiagrams(dir);
  referenced += wanted.size;
  mkdirSync(out, { recursive: true });

  /* Clear the folder first: stale files (a removed or edited diagram) leave no orphan. */
  for (const file of readdirSync(out).filter((f) => f.endsWith('.svg'))) {
    rmSync(join(out, file));
    pruned++;
  }

  if (wanted.size > 0) {
    const rendered = await render(wanted);
    for (const [hash, svg] of rendered) {
      writeFileSync(join(out, `${hash}.svg`), svg);
    }
    renderedCount += rendered.size;
  }
}

console.log(
  `diagrams: ${referenced} referenced, ${renderedCount} rendered, ${pruned} cleared.`,
);
