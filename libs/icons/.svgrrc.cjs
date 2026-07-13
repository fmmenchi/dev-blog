/*
 * SVGR — how a downloaded .svg becomes an accessible, themeable React icon.
 *
 * The sources are vendored (simple-icons), so they are NOT edited by hand:
 * re-downloading one would silently undo the edit. Everything an icon needs is
 * imposed here, where it survives the next download.
 *
 * COLOUR. Every icon must paint with `currentColor`, so it inherits the colour of
 * the text around it and follows the accent switch for free. There are two sources
 * of black, and only one of them is visible in the file:
 *
 *   - an EXPLICIT colour — `stroke="#000"`, or a brand hex — handled by
 *     `convertColors`, which leaves `none` alone, so a stroke-drawn icon keeps its
 *     `fill="none"` instead of filling in as a solid blob;
 *
 *   - an IMPLICIT one — simple-icons ship a bare `<path d="…">` with no `fill` at
 *     all, and SVG's default fill is black. There is no string to substitute here,
 *     which is why the old `replaceAttrValues: { '#000': … }` rule matched nothing
 *     and shipped two black-on-black icons. `iconCurrentColor` below addresses the
 *     actual cause: it gives the root <svg> a `fill` when the file declares none.
 */

/**
 * Paint the icon with the surrounding text colour when the file never says what
 * colour it is. Only the root <svg> is touched, and only when `fill` is absent —
 * a stroke-drawn icon says `fill="none"` and has to keep saying it.
 */
const iconCurrentColor = {
  name: 'iconCurrentColor',
  fn: () => ({
    element: {
      enter: (node, parentNode) => {
        if (node.name !== 'svg' || parentNode.type !== 'root') return;
        if (node.attributes.fill === undefined) {
          node.attributes.fill = 'currentColor';
        }
      },
    },
  }),
};

module.exports = {
  descProp: true,
  filenameCase: 'kebab',
  icon: true,
  jsxRuntime: 'automatic',
  prettier: true,
  svgo: true,
  svgoConfig: {
    /* `plugins` REPLACES the defaults, so preset-default is re-listed by hand. */
    plugins: [
      {
        name: 'preset-default',
        params: { overrides: { removeViewBox: false } },
      },
      'removeDimensions',
      { name: 'convertColors', params: { currentColor: true } },
      iconCurrentColor,
    ],
  },
  /*
   * `titleProp`/`descProp` turn on SVGR's accessible pattern: an icon accepts
   * `title`/`titleId` and renders a <title> referenced by aria-labelledby (WCAG
   * 1.1.1). WITHOUT a title an icon is decorative and the caller must hide it with
   * aria-hidden — the right call whenever the text beside it already says the same.
   */
  titleProp: true,
  typescript: true,
};
