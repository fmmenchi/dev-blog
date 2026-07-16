/*
 * The mermaid theme — the ONE place the diagrams' look is decided.
 *
 * mermaid renders colours into a browser, where our CSS tokens do not exist, so we cannot
 * hand it `var(--color-…)` directly (it does colour maths on the values and would choke).
 * Instead we feed it distinct SENTINEL hexes, then rewrite each one to its token in the
 * finished SVG — see recolour(). Because the SVG is inlined in the page, the tokens are
 * live: the diagram follows the dark theme AND the accent switch, exactly the way the
 * icons follow `currentColor`.
 *
 * To change how diagrams map onto the design system, change this file and nothing else.
 */

import { createHash } from 'node:crypto';

/** One sentinel per role. Arbitrary, just distinct and easy to grep. */
const SENTINEL = {
  node: '#111181',
  border: '#222282',
  text: '#333383',
  label: '#444484',
  labelBg: '#555585',
  accent: '#666686',
  accentText: '#777787',
};

/** What mermaid is told to paint with — sentinels, resolved to tokens after render. */
export const themeVariables = {
  background: 'transparent',
  primaryColor: SENTINEL.node,
  primaryBorderColor: SENTINEL.border,
  primaryTextColor: SENTINEL.text,
  lineColor: SENTINEL.border,
  secondaryColor: SENTINEL.node,
  tertiaryColor: SENTINEL.node,
  tertiaryTextColor: SENTINEL.label,
  edgeLabelBackground: SENTINEL.labelBg,
  fontSize: '14px',
};

export const mermaidConfig = {
  startOnLoad: false,
  theme: 'base',
  fontFamily: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
  themeVariables,
  flowchart: { curve: 'basis', padding: 14 },
};

/** classDef the diagrams use for an emphasised (accent) node: `:::accent`. */
export const accentClassDef = `classDef accent fill:${SENTINEL.accent},stroke:${SENTINEL.accent},color:${SENTINEL.accentText};`;

/** sentinel → design token. */
const TOKEN = {
  [SENTINEL.node]: 'var(--color-muted)',
  [SENTINEL.border]: 'var(--color-border-strong)',
  [SENTINEL.text]: 'var(--color-foreground)',
  [SENTINEL.label]: 'var(--color-muted-foreground)',
  [SENTINEL.labelBg]: 'var(--color-card)',
  [SENTINEL.accent]: 'var(--color-primary)',
  [SENTINEL.accentText]: 'var(--color-primary-foreground)',
};

/** Anything mermaid left black — arrowheads, mostly — becomes the line colour. Black on
 * a dark card is the invisible-icon bug; we do not ship it. */
const BLACK_TOKEN = 'var(--color-border-strong)';

const rgbForm = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return new RegExp(
    `rgb\\(\\s*${(n >> 16) & 255}\\s*,\\s*${(n >> 8) & 255}\\s*,\\s*${n & 255}\\s*\\)`,
    'gi',
  );
};

/** Rewrite every sentinel (hex or rgb form) and stray black to a token. */
/** Corner radius on node boxes, in SVG user units. 0 = mermaid's sharp corners. */
const NODE_RADIUS = 6;

/** Rewrite sentinel colours to tokens, and round the node boxes. */
export function recolour(svg) {
  let out = svg;
  for (const [hex, token] of Object.entries(TOKEN)) {
    out = out
      .replace(new RegExp(hex, 'gi'), token)
      .replace(rgbForm(hex), token);
  }
  out = out.replace(
    /#000000\b|#000\b|\brgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/gi,
    BLACK_TOKEN,
  );
  /* A node's box is `<rect class="basic label-container">`; mermaid gives it no rx.
     Add one so the boxes match the site's rounded cards. Edge-label backgrounds are a
     different rect and stay square. */
  return out.replace(
    /<rect class="basic label-container"/g,
    `<rect rx="${NODE_RADIUS}" ry="${NODE_RADIUS}" class="basic label-container"`,
  );
}

/** The id a diagram's SVG is filed under — content-addressed, so an edit regenerates. */
export function hashDiagram(source) {
  return createHash('sha256').update(source.trim()).digest('hex').slice(0, 12);
}
