/*
 * The figures for "Four UI bugs that never failed" — the ones that ARE the argument.
 *
 *   apps/blog/app/images/invisible-icons.png    the icons you cannot see
 *   apps/blog/app/images/invisible-border.png   the border you cannot see
 *   apps/blog/app/images/waiting-for-google.png the second and a half spent waiting
 *   apps/blog/app/images/shared-chunk.png       the dropdown the home page downloaded
 *
 * Every value in them is MEASURED, not illustrative: the contrast ratios, the timings,
 * the chunk sizes are the numbers in the article, and the icons are rendered from the
 * real vendored sources through the real transform. A figure that rounds its own numbers
 * for effect is a figure that cannot be quoted.
 *
 * Drawn in the browser the e2e suite already ships, on the site's own tokens and fonts.
 *
 *   node tools/post-images.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const BACKGROUND = 'oklch(21% 0.02 256)';
const CARD = 'oklch(26% 0.02 256)';
const MUTED_SURFACE = 'oklch(31% 0.02 256)'; // --color-muted / the old --color-border
const BORDER_WEAK = 'oklch(31% 0.02 256)'; // --color-border      → 1.18:1 on a card
const BORDER_STRONG = 'oklch(60% 0.016 256)'; // --color-border-strong → 3.94:1
const MUTED = 'oklch(74% 0.014 256)';
const FOREGROUND = 'oklch(95% 0.007 256)';
const ACCENT = 'oklch(86% 0.16 95)';
const DANGER = 'oklch(65% 0.19 25)';

const MONO = readFileSync(
  'apps/blog/public/fonts/jetbrains-mono-latin-wght-normal.woff2',
).toString('base64');
const SANS = readFileSync(
  'apps/blog/public/fonts/space-grotesk-latin-wght-normal.woff2',
).toString('base64');

const FONTS = `
  @font-face { font-family: 'JetBrains Mono'; src: url(data:font/woff2;base64,${MONO}) format('woff2'); font-weight: 100 800; }
  @font-face { font-family: 'Space Grotesk'; src: url(data:font/woff2;base64,${SANS}) format('woff2'); font-weight: 300 700; }
`;

const BASE = `
  ${FONTS}
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; background: ${BACKGROUND}; color: ${FOREGROUND};
    font-family: 'JetBrains Mono', monospace;
  }
  .panel {
    background: ${CARD}; border-radius: 14px; padding: 40px;
    display: flex; flex-direction: column; gap: 26px;
    align-items: flex-start; height: 100%; justify-content: center;
  }
  .label { font-size: 20px; color: ${MUTED}; }
  .label b { color: ${ACCENT}; font-weight: 500; }
  .note { font-size: 15px; color: ${MUTED}; line-height: 1.5; }
  .num { color: ${FOREGROUND}; }
  .bad { color: ${DANGER}; }
`;

/* ── 1. The icons ───────────────────────────────────────────────────────────────── */

/** The vendored sources, exactly as simple-icons ships them. */
const sources = ['github', 'linkedin', 'mail'].map((name) =>
  readFileSync(`libs/icons/svg/${name}.svg`, 'utf8').replace(
    /<title>.*?<\/title>/,
    '',
  ),
);

/**
 * What SVGR did BEFORE: substitute an explicit `#000`.
 *
 * It is why the mail icon always worked — it declares `stroke="#000"`, so the rule had
 * something to match. github.svg and linkedin.svg declare no colour at all, so the rule
 * matched nothing and they kept SVG's default fill, which is black.
 */
const before = (svg) => svg.replace(/stroke="#000"/g, 'stroke="currentColor"');

/**
 * What it does NOW: give the root <svg> a fill when the file declares none.
 *
 * The stroke-drawn mail icon says `fill="none"` and must keep saying it, or it fills in
 * as a solid blob — which is why the rule is "when absent", not "always".
 *
 * The first version of this figure got the AFTER panel wrong: it set `color` on the
 * wrapper and assumed the icons would inherit it. They do not — that is the entire bug.
 */
const after = (svg) =>
  /<svg[^>]*\sfill=/.test(svg)
    ? before(svg)
    : before(svg).replace('<svg', '<svg fill="currentColor"');

const iconRow = (transform) => `
  <div class="row">
    ${sources
      .map(
        (svg) =>
          `<span class="chip" style="color:${MUTED}">${transform(svg)
            .replace('<svg', `<svg width="18" height="18"`)
            .replace(/^\s+/, '')}</span>`,
      )
      .join('')}
  </div>`;

const icons = `<!doctype html><meta charset="utf-8">
<style>
  ${BASE}
  body { height: 480px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 56px; align-items: center; }
  .row { display: flex; gap: 14px; }
  .chip {
    width: 56px; height: 56px; border: 1px solid ${BORDER_STRONG}; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .chip svg { width: 24px; height: 24px; }
</style>
<body>
  <div class="panel">
    <p class="label"><b>before</b> — no fill declared</p>
    ${iconRow(before)}
    <p class="note">The build was green.<br>The icons are right there.</p>
  </div>
  <div class="panel">
    <p class="label"><b>after</b> — one line of svgr config</p>
    ${iconRow(after)}
    <p class="note">Same markup. Same tests.<br>Same <span class="num">color</span> on the wrapper.</p>
  </div>
</body>`;

/* ── 2. The border ──────────────────────────────────────────────────────────────── */

const badges = ['TypeScript', 'React', 'Nx'];

const badgeRow = (border, background) => `
  <div class="row">
    ${badges
      .map(
        (name) =>
          `<span class="badge" style="border-color:${border};background:${background}">${name}</span>`,
      )
      .join('')}
  </div>`;

const borderFigure = `<!doctype html><meta charset="utf-8">
<style>
  ${BASE}
  body { height: 480px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 56px; align-items: center; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .badge {
    border: 1px solid; border-radius: 999px; padding: 6px 14px;
    font-family: 'Space Grotesk', sans-serif; font-size: 16px; color: ${MUTED};
  }
  .ratio { font-size: 34px; letter-spacing: -0.02em; }
</style>
<body>
  <div class="panel">
    <p class="label"><b>before</b> — --color-border</p>
    ${badgeRow(BORDER_WEAK, 'transparent')}
    <p class="ratio bad">1.18 : 1</p>
    <p class="note">A separator, used as an edge.<br>The chips had no shape — only words.</p>
  </div>
  <div class="panel">
    <p class="label"><b>after</b> — --color-border-strong</p>
    ${badgeRow(BORDER_STRONG, MUTED_SURFACE)}
    <p class="ratio num">3.94 : 1</p>
    <p class="note">Clears 3:1 (WCAG 1.4.11).<br>The text was never the problem.</p>
  </div>
</body>`;

/* ── 3. Waiting for Google ──────────────────────────────────────────────────────── */

/**
 * A WATERFALL, not three bars on a shelf. The whole argument is that the requests are
 * SERIAL: gstatic.com cannot even begin until the stylesheet from googleapis.com has
 * arrived and been parsed, because that is where the font's URL is written down. Drawing
 * them starting at the same moment would show two requests. The truth is a chain.
 *
 * 190px = 1 second, so the bars are to scale against the 4.6s and 3.5s that were measured.
 */
const SEC = 190;

const wbar = (label, startS, durS, colour, text) => `
  <div class="track">
    <span class="tick">${label}</span>
    <span class="lane-body">
      <span class="bar" style="margin-left:${Math.round(startS * SEC)}px;width:${Math.round(durS * SEC)}px;background:${colour}"></span>
      <span class="bar-text" style="margin-left:8px;color:${colour}">${text}</span>
    </span>
  </div>`;

const waiting = `<!doctype html><meta charset="utf-8">
<style>
  ${BASE}
  body { height: 560px; padding: 50px 56px; display: flex; flex-direction: column; gap: 26px; justify-content: center; }
  h2 { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
  h2 span { color: ${ACCENT}; }
  .lane { display: flex; flex-direction: column; gap: 9px; }
  .lane > .label { font-size: 17px; margin-bottom: 2px; }
  .track { display: flex; align-items: center; }
  .tick { width: 178px; font-size: 13px; color: ${MUTED}; text-align: right; padding-right: 14px; flex: none; }
  .lane-body { display: flex; align-items: center; flex: 1; }
  .bar { height: 26px; border-radius: 4px; flex: none; }
  .bar-text { font-size: 13px; color: ${MUTED}; white-space: nowrap; }
  .paint { font-size: 15px; color: ${MUTED}; padding-left: 178px; padding-top: 4px; }
  .paint b { color: ${FOREGROUND}; font-weight: 400; }
  .paint .slow { color: ${DANGER}; }
  hr { border: 0; border-top: 1px solid ${BORDER_WEAK}; margin: 4px 0; }
</style>
<body>
  <h2>Total blocking time: <span>0 ms</span>. It was not slow — it was <span>waiting</span>.</h2>

  <div class="lane">
    <p class="label"><b class="bad">before</b> — fonts from Google</p>
    ${wbar('your server', 0, 0.13, MUTED, 'html')}
    ${wbar('fonts.googleapis.com', 0.13, 1.5, DANGER, 'dns · tls · request → a stylesheet')}
    ${wbar('fonts.gstatic.com', 1.63, 1.5, DANGER, 'dns · tls · request → the font itself')}
    <p class="paint">first paint at <b class="slow">4.6 s</b> — and nothing was executing</p>
  </div>

  <hr>

  <div class="lane">
    <p class="label"><b>after</b> — self-hosted</p>
    ${wbar('your server', 0, 0.13, MUTED, 'html')}
    ${wbar('your server', 0.13, 0.35, ACCENT, '/fonts/*.woff2 — same origin, already connected')}
    <p class="paint">first paint at <b>3.5 s</b>, and layout shift <b>0</b></p>
  </div>
</body>`;

/* ── 4. The shared chunk ────────────────────────────────────────────────────────── */

const box = (title, size, colour, note) => `
  <div class="box" style="border-color:${colour}">
    <p class="box-title">${title}</p>
    <p class="box-size" style="color:${colour}">${size}</p>
    <p class="box-note">${note}</p>
  </div>`;

const chunks = `<!doctype html><meta charset="utf-8">
<style>
  ${BASE}
  body { height: 540px; padding: 52px 60px; display: flex; flex-direction: column; gap: 26px; justify-content: center; }
  h2 { font-family: 'Space Grotesk', sans-serif; font-size: 25px; font-weight: 700; letter-spacing: -0.02em; }
  h2 span { color: ${ACCENT}; }
  .lane { display: flex; flex-direction: column; gap: 14px; }
  .lane > .label { font-size: 17px; }
  .row { display: flex; gap: 16px; align-items: stretch; }
  .box {
    flex: 1; border: 1px solid; border-radius: 12px; padding: 18px 20px;
    display: flex; flex-direction: column; gap: 6px; background: ${CARD};
  }
  .box-title { font-size: 14px; color: ${MUTED}; }
  .box-size { font-size: 24px; letter-spacing: -0.02em; }
  .box-note { font-size: 13px; color: ${MUTED}; line-height: 1.45; }
  hr { border: 0; border-top: 1px solid ${BORDER_WEAK}; }
</style>
<body>
  <h2>The home page downloaded a dropdown it <span>does not have</span>.</h2>

  <div class="lane">
    <p class="label"><b class="bad">before</b> — one shared chunk, on every page</p>
    <div class="row">
      ${box('shared — loaded everywhere', '102 KiB', DANGER, 'Button, Link… and Radix Select: a portal, a focus scope, floating positioning. Used by two routes. Paid for by all of them.')}
    </div>
  </div>

  <hr>

  <div class="lane">
    <p class="label"><b>after</b> — a dynamic import, AND a promise to the bundler</p>
    <div class="row">
      ${box('shared — loaded everywhere', '12 KiB', ACCENT, 'Only what every page actually uses.')}
      ${box('filter-bar — /blog and /projects', '78 KiB', MUTED, 'Radix Select, fetched by the two pages that show it.')}
    </div>
    <p class="note">Lazy-loading alone changed <span class="num">nothing</span>: the barrel kept Select alive, because a bundler must assume that importing a module might DO something. <span class="num">"sideEffects": ["*.css"]</span> is the promise that it does not — and only then can it be dropped.</p>
  </div>
</body>`;

/* ── draw ───────────────────────────────────────────────────────────────────────── */

const browser = await chromium.launch();

async function draw(html, file, height) {
  const page = await browser.newPage({
    viewport: { width: 1200, height },
    /* 2x: these are read on a phone as often as on a laptop. */
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const png = await page.screenshot({ type: 'png' });
  await page.close();

  const path = `apps/blog/app/images/${file}`;
  writeFileSync(path, png);
  console.log(`  ${path} (${Math.round(png.length / 1024)} KB)`);
}

await draw(icons, 'invisible-icons.png', 480);
await draw(borderFigure, 'invisible-border.png', 480);
await draw(waiting, 'waiting-for-google.png', 540);
await draw(chunks, 'shared-chunk.png', 540);

await browser.close();
