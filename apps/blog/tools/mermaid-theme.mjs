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
  /* Sequence diagrams do not derive these from primaryColor: notes ship mermaid's own
     yellow and the boxes its own grey, neither of which recolour() would ever see. Name
     them so a sequence diagram lands on the same roles as every other diagram. */
  noteBkgColor: SENTINEL.node,
  noteTextColor: SENTINEL.text,
  noteBorderColor: SENTINEL.border,
  actorBkg: SENTINEL.node,
  actorBorder: SENTINEL.border,
  actorTextColor: SENTINEL.text,
  actorLineColor: SENTINEL.border,
  signalColor: SENTINEL.text,
  signalTextColor: SENTINEL.text,
  labelBoxBkgColor: SENTINEL.node,
  labelBoxBorderColor: SENTINEL.border,
  labelTextColor: SENTINEL.text,
  loopTextColor: SENTINEL.text,
  activationBkgColor: SENTINEL.node,
  activationBorderColor: SENTINEL.border,
  sequenceNumberColor: SENTINEL.accentText,
};

export const mermaidConfig = {
  startOnLoad: false,
  theme: 'base',
  fontFamily: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
  themeVariables,
  flowchart: { curve: 'basis', padding: 14 },
  /* C4 draws relationship labels straight onto the canvas, with no background and no
     attempt to avoid the boxes — so the gap between two shapes has to be wide enough to
     hold the longest label, or it lands on a box and becomes unreadable. 90 is the
     smallest margin at which none of our labels overlaps a box; the empty band this
     leaves around the diagram is cropped away after render (see mermaid-generate.mjs). */
  c4: { diagramMarginX: 8, diagramMarginY: 8, c4ShapeMargin: 90 },
};

/* Two sentinels the render step needs by hand: one to spot accented shapes in the DOM,
   one to paint the arrowheads it normalises across diagram types. */
export const ACCENT_SENTINEL = SENTINEL.accent;
export const TEXT_SENTINEL = SENTINEL.text;

/* mermaid gives each diagram type its own arrowhead and its own corner radius, so a
   flowchart and a C4 in one article do not look like one hand drew them. These are the
   C4's, and the render step puts every diagram on them. */
export const SHARED_SHAPE = {
  headSize: 10,
  headAnchor: 9,
  radius: 2.5,
  borderWidth: '0.5',
};

/** classDef the diagrams use for an emphasised (accent) node: `:::accent`. */
export const accentClassDef = `classDef accent fill:${SENTINEL.accent},stroke:${SENTINEL.accent},color:${SENTINEL.accentText};`;

/*
 * C4 is the one diagram type that ignores themeVariables: its blues are baked into the
 * renderer, so there is nothing for recolour() to rewrite. The only lever mermaid gives
 * is per element, which means the styling has to name every alias in the diagram — so we
 * read them out of the source here rather than making each article repeat them. Mark the
 * subject with a `%% accent <alias> [<alias>…]` comment and those elements get the accent
 * instead; `%% accent-rel <from> <to>` does the same for one relation's line.
 */
/* Every C4 element type, spelled as a base plus the optional suffixes mermaid allows,
   rather than as a hand-kept list — an unlisted type is not a no-op, it is an element left
   painted in mermaid's blue. `*_Boundary(` does not match: the suffix alternation has to be
   followed by the opening bracket. */
const C4_ELEMENT =
  /^\s*(?:Deployment_Node|Person|System|Container|Component|Node)(?:Db|Queue)?(?:_Ext)?\s*\(\s*([A-Za-z0-9_]+)/gm;
const C4_ACCENT = /^\s*%%\s*accent\s+([A-Za-z0-9_ ]+?)\s*$/m;
const C4_ACCENT_REL =
  /^\s*%%\s*accent-rel\s+([A-Za-z0-9_]+)\s+([A-Za-z0-9_]+)\s*$/gm;

export function c4ThemeDirectives(source) {
  const accented = new Set(
    (source.match(C4_ACCENT)?.[1] ?? '').split(/\s+/).filter(Boolean),
  );
  const lines = [];

  for (const [, alias] of source.matchAll(C4_ELEMENT)) {
    const isAccent = accented.has(alias);
    lines.push(
      `UpdateElementStyle(${alias}, $bgColor="${isAccent ? SENTINEL.accent : SENTINEL.node}", $borderColor="${isAccent ? SENTINEL.accent : SENTINEL.border}", $fontColor="${isAccent ? SENTINEL.accentText : SENTINEL.text}")`,
    );
  }

  /* `%% accent-rel <from> <to>` accents one relation — the LINE only. The label keeps the
     normal text role: it is drawn straight onto the canvas with no background, so it can
     end up over an accented box, where an accent-coloured label would vanish. */
  for (const [, from, to] of source.matchAll(C4_ACCENT_REL)) {
    lines.push(
      `UpdateRelStyle(${from}, ${to}, $lineColor="${SENTINEL.accent}", $textColor="${SENTINEL.text}")`,
    );
  }
  return lines.join('\n');
}

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
  /* C4 paints everything that is not a box — boundary outline, relationship lines and
     both sets of labels — in one grey of its own, which no directive reaches. Split it
     by role on the way out: strokes take the line colour, text takes the label colour,
     the same two the other diagrams use. */
  out = out
    .replace(/stroke="#444444"/gi, `stroke="${TOKEN[SENTINEL.border]}"`)
    .replace(/fill="#444444"/gi, `fill="${TOKEN[SENTINEL.label]}"`);
  /* The sequence renderer writes the actor box straight onto the rect as attributes, so
     the theme variables above never reach it. Same split by role on the way out. */
  out = out
    .replace(/fill="#eaeaea"/gi, `fill="${TOKEN[SENTINEL.node]}"`)
    .replace(/stroke="#(?:666|999)"/gi, `stroke="${TOKEN[SENTINEL.border]}"`);
  return out;
}

/** The id a diagram's SVG is filed under — content-addressed, so an edit regenerates. */
export function hashDiagram(source) {
  return createHash('sha256').update(source.trim()).digest('hex').slice(0, 12);
}
