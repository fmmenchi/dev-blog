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
  ACCENT_SENTINEL,
  SHARED_SHAPE,
  TEXT_SENTINEL,
  accentClassDef,
  c4ThemeDirectives,
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
    /*
     * `classDef` is flowchart syntax — appending it to any other diagram type is a
     * parse error, not a no-op. Only flowcharts get the accent class. C4 needs its own
     * treatment because it ignores themeVariables entirely (see mermaid-theme.mjs).
     * Everything else is rendered as written and takes its colours from themeVariables.
     */
    const withAccent = /^\s*(flowchart|graph)\b/.test(source)
      ? `${source}\n${accentClassDef}`
      : /^\s*C4\w+/.test(source)
        ? `${source}\n${c4ThemeDirectives(source)}`
        : source;

    /* The id stays keyed to the diagram as written, so adding the class above does not
       renumber every SVG that did not change. */
    const id =
      'm' + Math.abs([...source].reduce((a, c) => a + c.charCodeAt(0), 0));

    const svg = await page.evaluate(
      async ({ id, source, config, accent, text, shape }) => {
        // @ts-expect-error injected global
        mermaid.initialize(config);
        // @ts-expect-error injected global
        const { svg } = await mermaid.render(id, source);

        /*
         * C4 needs two things done to the finished SVG that no config option reaches, and
         * both need a real DOM: it stamps a type label on every element (`<<container>>`)
         * and on the boundary (`[CONTAINER]`) — the diagram already says what these are —
         * and it sizes the canvas with a wide band of empty space around the outermost
         * boundary. So mount it, strip the labels, then crop to what is actually drawn.
         * Scoped to C4: the other diagram types size themselves to their content already.
         */
        const holder = document.createElement('div');
        holder.innerHTML = svg;
        document.body.appendChild(holder);
        const el = holder.querySelector('svg');

        /* One arrowhead and one border across every diagram type. mermaid draws a
           flowchart's head smaller and dimmer than a C4's and rounds its boxes more, which
           reads as two different hands on one page. Only heads actually referenced by a
           marker-end are touched — a start marker anchors at the other end and would be
           thrown off by the same numbers. */
        for (const id of new Set(
          [...el.querySelectorAll('[marker-end]')]
            .map(
              (n) =>
                /url\(#(.+)\)/.exec(n.getAttribute('marker-end') || '')?.[1],
            )
            .filter(Boolean),
        )) {
          const head = el.querySelector(`#${CSS.escape(id)}`);
          if (!head) continue;
          head.setAttribute('markerWidth', String(shape.headSize));
          head.setAttribute('markerHeight', String(shape.headSize));
          head.setAttribute('refX', String(shape.headAnchor));
          for (const drawn of head.querySelectorAll('path, polygon')) {
            drawn.setAttribute('fill', text);
            drawn.removeAttribute('style');
          }
        }

        for (const box of [...el.querySelectorAll('rect.label-container')]) {
          box.setAttribute('rx', String(shape.radius));
          box.setAttribute('ry', String(shape.radius));
          box.style.strokeWidth = shape.borderWidth;
        }

        if (el?.getAttribute('aria-roledescription') === 'c4') {
          for (const node of [...el.querySelectorAll('text')]) {
            const label = (node.textContent || '').trim();
            if (/^<<.*>>$/.test(label) || /^\[[A-Z][A-Z_ ]*\]$/.test(label))
              node.remove();
          }

          /* Every relation points at ONE shared arrowhead marker, and a marker takes its
             fill from the diagram, not from the line referencing it — so an accented
             relation comes out as a yellow line with a pale tip. Clone the marker for the
             accented ones and paint the clone. */
          const accentMarkers = new Map();
          const accentRelations = [];
          for (const drawn of [...el.querySelectorAll('[marker-end]')]) {
            if (drawn.getAttribute('stroke') !== accent) continue;
            accentRelations.push(drawn);
            const ref = /url\(#(.+)\)/.exec(
              drawn.getAttribute('marker-end') || '',
            )?.[1];
            const original = ref && el.querySelector(`#${CSS.escape(ref)}`);
            if (!original) continue;

            let cloneId = accentMarkers.get(ref);
            if (!cloneId) {
              cloneId = `${ref}-accent`;
              const clone = original.cloneNode(true);
              clone.setAttribute('id', cloneId);
              for (const part of clone.querySelectorAll('path, polygon')) {
                part.setAttribute('fill', accent);
              }
              original.parentNode.appendChild(clone);
              accentMarkers.set(ref, cloneId);
            }
            drawn.setAttribute('marker-end', `url(#${cloneId})`);
          }

          /* C4 works out each end of a relation on its own, so an arrow between two
             perfectly aligned shapes still drifts several pixels across — and since it is
             always drawn as a curve, never as a segment, the drift shows up as a bend.
             Straighten the ones that were meant to be straight; a real diagonal keeps its
             curve, which is what tells the crossing pair apart. */
          const DRIFT = 20;
          const midpoint = (a, b) => (a + b) / 2;

          for (const seg of [...el.querySelectorAll('line[marker-end]')]) {
            const x1 = +seg.getAttribute('x1');
            const y1 = +seg.getAttribute('y1');
            const x2 = +seg.getAttribute('x2');
            const y2 = +seg.getAttribute('y2');
            if (Math.abs(y2 - y1) <= DRIFT && Math.abs(x2 - x1) > DRIFT) {
              const y = midpoint(y1, y2);
              seg.setAttribute('y1', String(y));
              seg.setAttribute('y2', String(y));
            } else if (
              Math.abs(x2 - x1) <= DRIFT &&
              Math.abs(y2 - y1) > DRIFT
            ) {
              const x = midpoint(x1, x2);
              seg.setAttribute('x1', String(x));
              seg.setAttribute('x2', String(x));
            }
          }

          for (const curve of [...el.querySelectorAll('path[marker-end]')]) {
            const d = curve.getAttribute('d') || '';
            const points =
              /^M\s*(-?[\d.]+),(-?[\d.]+)\s*Q\s*-?[\d.]+,-?[\d.]+\s+(-?[\d.]+),(-?[\d.]+)\s*$/.exec(
                d,
              );
            if (!points) continue;
            const [x1, y1, x2, y2] = points.slice(1).map(Number);
            if (Math.abs(x2 - x1) <= DRIFT && Math.abs(y2 - y1) > DRIFT) {
              const x = midpoint(x1, x2);
              curve.setAttribute('d', `M${x},${y1} L${x},${y2}`);
            } else if (
              Math.abs(y2 - y1) <= DRIFT &&
              Math.abs(x2 - x1) > DRIFT
            ) {
              const y = midpoint(y1, y2);
              curve.setAttribute('d', `M${x1},${y} L${x2},${y}`);
            }
          }

          /* An accented relation is the one the diagram is about, so its label carries the
             weight too. C4 has no lever for that, and the label is a loose text node rather
             than a child of the relation — so pair them by position, once the geometry is
             final: the nearest label to the accented arrow's midpoint is its own. */
          for (const relation of accentRelations) {
            const near = relation.getBBox();
            const cx = near.x + near.width / 2;
            const cy = near.y + near.height / 2;

            let best = null;
            let bestDistance = 80;
            for (const text of [...el.querySelectorAll('text')]) {
              const b = text.getBBox();
              const distance = Math.hypot(
                b.x + b.width / 2 - cx,
                b.y + b.height / 2 - cy,
              );
              if (distance < bestDistance) {
                bestDistance = distance;
                best = text;
              }
            }
            if (best) best.style.fontWeight = 'bold';
          }

          /* C4 sizes a boundary from its shape margins, not from what ended up inside it,
             so the dashed frame sits a long way off its own contents. Pull it in to hug
             them, keeping a band at the top for the boundary's title. */
          const PAD = 22;
          const TITLE_BAND = 34;
          for (const frame of [
            ...el.querySelectorAll('rect[stroke-dasharray]'),
          ]) {
            const outer = frame.getBBox();
            const within = (b) =>
              b.width > 0 &&
              b.height > 0 &&
              b.x >= outer.x - 1 &&
              b.y >= outer.y - 1 &&
              b.x + b.width <= outer.x + outer.width + 1 &&
              b.y + b.height <= outer.y + outer.height + 1;

            const shapes = [
              ...el.querySelectorAll('rect:not([stroke-dasharray])'),
            ]
              .filter((n) => n !== frame)
              .map((n) => n.getBBox())
              .filter(within);
            if (!shapes.length) continue;

            const union = (list) => ({
              x: Math.min(...list.map((b) => b.x)),
              y: Math.min(...list.map((b) => b.y)),
              right: Math.max(...list.map((b) => b.x + b.width)),
              bottom: Math.max(...list.map((b) => b.y + b.height)),
            });
            const shapeBox = union(shapes);

            /* A text sitting entirely above the shapes is the boundary's title; anything
               else is a label that belongs inside the frame. */
            const texts = [...el.querySelectorAll('text')]
              .map((n) => ({ node: n, b: n.getBBox() }))
              .filter(({ b }) => within(b));
            const titles = texts.filter(
              ({ b }) => b.y + b.height <= shapeBox.y,
            );
            const content = union([
              ...shapes,
              ...texts.filter((t) => !titles.includes(t)).map((t) => t.b),
            ]);

            const x = content.x - PAD;
            const y = content.y - PAD - TITLE_BAND;
            frame.setAttribute('x', String(x));
            frame.setAttribute('y', String(y));
            frame.setAttribute(
              'width',
              String(content.right - content.x + PAD * 2),
            );
            frame.setAttribute(
              'height',
              String(content.bottom - content.y + PAD * 2 + TITLE_BAND),
            );

            for (const { node } of titles) {
              node.setAttribute('x', String((x + content.right + PAD) / 2));
              node.setAttribute('y', String(y + TITLE_BAND / 2));
            }
          }

          const box = el.getBBox();
          const pad = 4;
          el.setAttribute(
            'viewBox',
            `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`,
          );
          el.setAttribute('width', String(Math.round(box.width + pad * 2)));
          el.setAttribute('height', String(Math.round(box.height + pad * 2)));
          /* mermaid pins a max-width to the OLD width in an inline style; the article's
             wrapper already constrains the diagram, so drop it rather than fix it up. */
          el.removeAttribute('style');
        }

        const out = el ? el.outerHTML : svg;
        holder.remove();
        return out;
      },
      {
        id,
        source: withAccent,
        config: mermaidConfig,
        accent: ACCENT_SENTINEL,
        text: TEXT_SENTINEL,
        shape: SHARED_SHAPE,
      },
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
