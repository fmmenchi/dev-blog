/*
 * Generates the figures a post needs — the ones that ARE the argument, not decoration.
 *
 *   apps/blog/app/images/invisible-icons.png
 *
 * "Four bugs that never failed" claims that a bug can break nothing and simply vanish.
 * That claim is hard to make in prose and trivial to make in a picture: on the left the
 * reader sees an empty box, on the right they see GitHub and LinkedIn. The paragraph
 * explains; the image demonstrates.
 *
 * Drawn in the browser we already have, from the REAL icon sources and the real tokens,
 * so the "before" is genuinely what shipped — a black `<path>` with no fill, on the
 * background it was invisible against — and not an artist's impression of it.
 *
 *   node tools/post-images.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const BACKGROUND = 'oklch(21% 0.02 256)';
const CARD = 'oklch(26% 0.02 256)';
const MUTED = 'oklch(74% 0.014 256)';
const BORDER_STRONG = 'oklch(60% 0.016 256)';
const FOREGROUND = 'oklch(95% 0.007 256)';
const ACCENT = 'oklch(86% 0.16 95)';

const MONO = readFileSync(
  'apps/blog/public/fonts/jetbrains-mono-latin-wght-normal.woff2',
).toString('base64');

/** The vendored sources, exactly as simple-icons ships them: a bare path, no fill. */
const icons = ['github', 'linkedin', 'mail'].map((name) =>
  readFileSync(`libs/icons/svg/${name}.svg`, 'utf8')
    .replace(/<title>.*?<\/title>/, '')
    .replace(/stroke="#000"/, 'stroke="currentColor"'),
);

/** `fill` is what the whole bug was about, so it is the only thing that differs. */
const row = (fill) => `
  <div class="row">
    ${icons
      .map(
        (svg) =>
          `<span class="chip" style="color:${fill}">${svg
            .replace('<svg', `<svg width="18" height="18"`)
            .replace(/^\s+/, '')}</span>`,
      )
      .join('')}
  </div>`;

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'JetBrains Mono'; src: url(data:font/woff2;base64,${MONO}) format('woff2'); font-weight: 100 800; }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 480px; background: ${BACKGROUND}; color: ${FOREGROUND};
    font-family: 'JetBrains Mono', monospace;
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 56px;
    align-items: center;
  }
  .panel {
    background: ${CARD}; border-radius: 14px; padding: 40px;
    display: flex; flex-direction: column; gap: 28px; align-items: flex-start;
    height: 100%; justify-content: center;
  }
  .label { font-size: 20px; color: ${MUTED}; }
  .label b { color: ${ACCENT}; font-weight: 500; }
  .row { display: flex; gap: 14px; }
  .chip {
    width: 56px; height: 56px; border: 1px solid ${BORDER_STRONG}; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .chip svg { width: 24px; height: 24px; }
  .note { font-size: 15px; color: ${MUTED}; line-height: 1.5; }
</style>
<body>
  <div class="panel">
    <p class="label"><b>before</b> — no fill declared</p>
    ${row('#000')}
    <p class="note">The build was green.<br>The icons are right there.</p>
  </div>
  <div class="panel">
    <p class="label"><b>after</b> — currentColor</p>
    ${row(MUTED)}
    <p class="note">Same markup. Same tests.<br>One line of config.</p>
  </div>
</body>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 480 },
  /* 2x: the figure is read on a phone as often as on a laptop. */
  deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const png = await page.screenshot({ type: 'png' });
await browser.close();

const out = 'apps/blog/app/images/invisible-icons.png';
writeFileSync(out, png);
console.log(`post-images: ${out} (${Math.round(png.length / 1024)} KB)`);
