/*
 * SVGR — the accessibility convention for icons, following andes-routes.
 *
 * `titleProp`/`descProp` turn on SVGR's native accessible pattern: every icon
 * accepts `title`/`titleId`, and when given renders a <title> referenced by
 * aria-labelledby (WCAG 1.1.1). WITHOUT a title the icon is decorative, and the
 * caller must hide it with aria-hidden — which is the right call whenever the
 * text beside it already says the same thing.
 *
 * `#000` → `currentColor`: the icon inherits the colour of its text, so it
 * follows the accent switch for free and never hardcodes a palette value.
 */
module.exports = {
  descProp: true,
  filenameCase: 'kebab',
  icon: true,
  jsxRuntime: 'automatic',
  prettier: true,
  replaceAttrValues: { '#000': 'currentColor', '#000000': 'currentColor' },
  svgo: true,
  svgoConfig: {
    plugins: [
      { active: false, name: 'removeViewBox' },
      { active: true, name: 'removeDimensions' },
      { active: true, name: 'convertPathData' },
    ],
  },
  titleProp: true,
  typescript: true,
};
