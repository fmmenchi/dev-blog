/*
 * Prints the metric-adjusted @font-face fallbacks for `libs/theme/src/styles/fonts.css`.
 *
 * `font-display: swap` paints the text immediately in a fallback face and swaps in
 * the real one when it lands. That is what keeps text from being invisible while a
 * font downloads — but a naive fallback has different metrics, so the swap SHIFTS
 * the layout under the reader's eyes (bad CLS).
 *
 * The fix is a fallback that lies about its own metrics: `src: local('Arial')` with
 * ascent/descent/size overrides computed so Arial occupies exactly the space the
 * real font will. The reader sees text at once, and nothing moves when it swaps.
 *
 * Run it when a font changes; paste the output into fonts.css. Keeping it a script
 * rather than a build step is deliberate — the numbers are stable, and a build that
 * parses two fonts on every run to print constants is a build that is slower for
 * no reason.
 *
 *   node tools/font-metrics.mjs
 */
import { readFileSync } from 'node:fs';

import * as fontkit from 'fontkit';

/* Arial, the fallback we override. Its own metrics are the baseline we scale from. */
const ARIAL = { unitsPerEm: 2048, xAvgCharWidth: 904 };

const FONTS = [
  {
    family: 'Space Grotesk Variable',
    file: 'apps/blog/public/fonts/space-grotesk-latin-wght-normal.woff2',
  },
  {
    family: 'JetBrains Mono Variable',
    file: 'apps/blog/public/fonts/jetbrains-mono-latin-wght-normal.woff2',
  },
];

const percent = (n) => `${(n * 100).toFixed(4).replace(/\.?0+$/, '')}%`;

for (const { family, file } of FONTS) {
  const font = fontkit.create(readFileSync(file));
  const { unitsPerEm, ascent, descent, lineGap } = font;

  /*
   * Scale the fallback's glyph widths to the real font's, so a line of text breaks
   * in the same place before and after the swap.
   */
  const xAvgCharWidth = font['OS/2']?.xAvgCharWidth ?? ARIAL.xAvgCharWidth;
  const sizeAdjust =
    xAvgCharWidth / unitsPerEm / (ARIAL.xAvgCharWidth / ARIAL.unitsPerEm);

  /* The overrides are expressed relative to the ADJUSTED em, hence the division. */
  console.log(`@font-face {
  font-family: '${family} Fallback';
  src: local('Arial');
  size-adjust: ${percent(sizeAdjust)};
  ascent-override: ${percent(ascent / unitsPerEm / sizeAdjust)};
  descent-override: ${percent(Math.abs(descent) / unitsPerEm / sizeAdjust)};
  line-gap-override: ${percent(lineGap / unitsPerEm / sizeAdjust)};
}
`);
}
