/*
 * Generates the social preview card — apps/blog/public/og.png, 1200x630.
 *
 * Shared links used to render as a grey line of text: there was no og:image, and
 * twitter:card was `summary`, which without an image produces no card at all. This is
 * the first thing anyone sees of the site, and it was the one thing the site did not have.
 *
 * It is drawn in the browser we already have (Playwright, from the e2e suite) rather
 * than with an image library, so the card is built from the SAME tokens and the SAME
 * self-hosted fonts as the site. A card that drifts from the site it advertises is
 * worse than no card.
 *
 * Run it when the palette, the name or the tagline change; commit the PNG.
 *
 *   node tools/og-image.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const FONT = readFileSync(
  'apps/blog/public/fonts/space-grotesk-latin-wght-normal.woff2',
).toString('base64');
const MONO = readFileSync(
  'apps/blog/public/fonts/jetbrains-mono-latin-wght-normal.woff2',
).toString('base64');

/* The tokens, by value: this file cannot import theme.css, so they are repeated here
   and nowhere else. If the accent changes, change it here too. */
const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Space Grotesk';
    src: url(data:font/woff2;base64,${FONT}) format('woff2');
    font-weight: 300 700;
  }
  @font-face {
    font-family: 'JetBrains Mono';
    src: url(data:font/woff2;base64,${MONO}) format('woff2');
    font-weight: 100 800;
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background: oklch(21% 0.02 256);
    color: oklch(95% 0.007 256);
    font-family: 'Space Grotesk', sans-serif;
    padding: 80px;
    display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  /* A slab of the accent down the left edge — the site's one loud colour. */
  body::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 16px;
    background: oklch(86% 0.16 95);
  }
  h1 {
    font-size: 76px; line-height: 1.08; font-weight: 700; letter-spacing: -0.03em;
    max-width: 15ch;
  }
  .accent { color: oklch(86% 0.16 95); }
  p { font-size: 30px; line-height: 1.5; color: oklch(74% 0.014 256); max-width: 26ch; }
  .foot {
    font-family: 'JetBrains Mono', monospace; font-size: 22px;
    color: oklch(74% 0.014 256);
    display: flex; justify-content: space-between; align-items: baseline;
  }
  .foot b { color: oklch(95% 0.007 256); font-weight: 500; }
</style>
<body>
  <div>
    <h1>Software, systems and the <span class="accent">decisions</span> behind the code.</h1>
  </div>
  <div class="foot">
    <span><b>fabiomenchicchi<span class="accent">.com</span></b></span>
    <span>Fabio Menchicchi · full stack engineer</span>
  </div>
</body>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const png = await page.screenshot({ type: 'png' });
await browser.close();

writeFileSync('apps/blog/public/og.png', png);
console.log(
  `og-image: apps/blog/public/og.png (${Math.round(png.length / 1024)} KB)`,
);
