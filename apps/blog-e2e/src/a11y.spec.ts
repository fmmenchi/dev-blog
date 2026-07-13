import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

import { firstPost } from './support/content';

const PAGES = [
  '/',
  '/blog',
  /* A filtered list is a different DOM: the toolbar, the combobox, the status. */
  '/blog?tag=meta',
  `/blog/${firstPost().slug}`,
  '/projects',
  '/about',
  '/colophon',
  '/uses',
];

for (const path of PAGES) {
  test(`axe: ${path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      /*
       * `best-practice` as well as WCAG, and it earns its place immediately: the post
       * page shipped with NO <main> landmark, in production, and this sweep passed it
       * every single time — because `landmark-one-main` is a best-practice rule and we
       * were only asking about WCAG A/AA.
       *
       * A rule you did not ask for is a rule that cannot fail.
       */
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
