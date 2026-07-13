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
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
