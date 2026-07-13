/*
 * Generates apps/blog/public/apple-touch-icon.png (180x180).
 *
 * iOS does NOT fall back to the favicon. When someone adds the site to their home
 * screen and this file is missing, iOS uses a SCREENSHOT of the page — which on a dark
 * site is an unreadable black rectangle with microscopic text. This is the one icon
 * whose absence produces something visibly broken.
 *
 * Two things differ from favicon.svg on purpose:
 *
 *   - NO rounded corners. iOS applies its own mask. Ship a pre-rounded icon and the
 *     corners outside the radius come back as black.
 *   - The real JetBrains Mono is embedded. A standalone SVG naming the family gets
 *     whatever monospace the renderer has lying around, and the F would not be ours.
 *
 * It is static: unlike the favicon, which the accent switcher repaints at runtime, a
 * home-screen icon is chosen once and kept. It ships in the default accent.
 *
 *   node tools/app-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const MONO = readFileSync(
  'apps/blog/public/fonts/jetbrains-mono-latin-wght-normal.woff2',
).toString('base64');

/* The same two values as favicon.svg: background neutral-950, the yellow accent. */
const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'JetBrains Mono';
    src: url(data:font/woff2;base64,${MONO}) format('woff2');
    font-weight: 100 800;
  }
  * { margin: 0; }
  body {
    width: 180px; height: 180px;
    background: oklch(21% 0.02 256);
    color: oklch(86% 0.16 95);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700; font-size: 118px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  /* Optical centring: the cap-height box is not the glyph. */
  span { transform: translateY(-4px); }
</style>
<body><span>F</span></body>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 180, height: 180 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const png = await page.screenshot({ type: 'png' });
await browser.close();

writeFileSync('apps/blog/public/apple-touch-icon.png', png);
console.log(
  `app-icons: apps/blog/public/apple-touch-icon.png (${Math.round(png.length / 1024)} KB)`,
);
