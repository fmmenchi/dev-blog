/*
 * Generates the social preview cards — 1200x630 PNGs under apps/blog/public.
 *
 *   apps/blog/public/og.png             the site
 *   apps/blog/public/og/<slug>.png      one per post
 *
 * Shared links used to render as a grey line of text: there was no og:image, and
 * twitter:card was `summary`, which without an image produces no card at all.
 *
 * A post gets its OWN card, carrying its title. That is the difference between a link
 * that says "someone shared fabiomenchicchi.com" and one that says "someone shared this
 * piece" — and the title in the card is the first, and often only, thing a reader
 * scrolling a feed will ever see of it.
 *
 * They are drawn in the browser we already have (Playwright, from the e2e suite) rather
 * than with an image library, so a card is built from the SAME tokens and the SAME
 * self-hosted fonts as the site. A card that drifts from the site it advertises is
 * worse than no card.
 *
 * Run it after writing or renaming a post, and commit the PNG. `tools/check-og.mjs`
 * fails the build if a post has no card — a missing one is a broken image in someone
 * else's feed, which is the last place you would ever notice it.
 *
 *   node tools/og-image.mjs
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

const POSTS_DIR = 'apps/blog/content/posts';
const OUT_DIR = 'apps/blog/public';

const SANS = readFileSync(
  'apps/blog/public/fonts/space-grotesk-latin-wght-normal.woff2',
).toString('base64');
const MONO = readFileSync(
  'apps/blog/public/fonts/jetbrains-mono-latin-wght-normal.woff2',
).toString('base64');

/* The tokens, by value: this file cannot import theme.css. Change the accent, change
   it here — and regenerate. */
const BACKGROUND = 'oklch(21% 0.02 256)';
const FOREGROUND = 'oklch(95% 0.007 256)';
const MUTED = 'oklch(74% 0.014 256)';
const ACCENT = 'oklch(86% 0.16 95)';

const escape = (text) =>
  text.replace(
    /[&<>"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character],
  );

/**
 * @param headline the card's title. Long post titles get a smaller face so the card
 * never overflows — a clipped headline is worse than a small one.
 * @param eyebrow the mono line above it, or none for the site card.
 */
function card(headline, eyebrow) {
  const size = headline.length > 46 ? 58 : headline.length > 30 ? 68 : 76;

  return `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'Space Grotesk'; src: url(data:font/woff2;base64,${SANS}) format('woff2'); font-weight: 300 700; }
  @font-face { font-family: 'JetBrains Mono'; src: url(data:font/woff2;base64,${MONO}) format('woff2'); font-weight: 100 800; }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background: ${BACKGROUND}; color: ${FOREGROUND};
    font-family: 'Space Grotesk', sans-serif;
    padding: 80px;
    display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  /* A slab of the accent down the left edge — the site's one loud colour. */
  body::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 16px;
    background: ${ACCENT};
  }
  .eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 24px; color: ${ACCENT};
    margin-bottom: 26px;
  }
  h1 {
    font-size: ${size}px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em;
    max-width: 17ch;
  }
  .accent { color: ${ACCENT}; }
  .foot {
    font-family: 'JetBrains Mono', monospace; font-size: 22px; color: ${MUTED};
    display: flex; justify-content: space-between; align-items: baseline;
  }
  .foot b { color: ${FOREGROUND}; font-weight: 500; }
</style>
<body>
  <div>
    ${eyebrow ? `<p class="eyebrow">${escape(eyebrow)}</p>` : ''}
    <h1>${headline}</h1>
  </div>
  <div class="foot">
    <span><b>fabiomenchicchi<span class="accent">.com</span></b></span>
    <span>Fabio Menchicchi · full stack engineer</span>
  </div>
</body>`;
}

/** title + date, straight from the frontmatter. */
function readPosts() {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(join(POSTS_DIR, file), 'utf8');
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(raw)?.[1] ?? '';
      const field = (name) =>
        new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]?.trim() ??
        '';

      return {
        slug: file.replace(/\.md$/, ''),
        title: field('title'),
        date: field('date'),
      };
    });
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

async function draw(html, path) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(path, await page.screenshot({ type: 'png' }));
  console.log(`  ${path}`);
}

/* The site card keeps the home page's own headline, accent and all. */
await draw(
  card(
    'Software, systems and the <span class="accent">decisions</span> behind the code.',
    null,
  ),
  join(OUT_DIR, 'og.png'),
);

mkdirSync(join(OUT_DIR, 'og'), { recursive: true });
for (const post of readPosts()) {
  await draw(
    card(escape(post.title), `// ${post.date}`),
    join(OUT_DIR, 'og', `${post.slug}.png`),
  );
}

await browser.close();
