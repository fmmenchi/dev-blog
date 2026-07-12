/*
 * The barrel svgr writes into libs/icons/src.
 *
 * Names are PascalCase on purpose: a lowercase identifier in JSX is parsed as an
 * HTML tag, not a component, so `<github />` would silently render nothing.
 *
 * The whole src/ directory is generated and git-ignored — nothing hand-written
 * lives there, so `nx run @dev-blog/icons:generate` can wipe and rewrite it
 * without destroying anyone's work. The source of truth is svg/.
 */
const path = require('node:path');

const pascal = (name) =>
  name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

module.exports = (filePaths) =>
  filePaths
    .map(({ path: filePath }) => {
      const base = path.basename(filePath, path.extname(filePath));
      return `export { default as ${pascal(base)}Icon } from './${base}';`;
    })
    .join('\n') + '\n';
