import { expect, test } from './fixtures';

import { firstPost, posts } from './support/content';

const post = firstPost();

test.describe('article', () => {
  test('shows the table of contents and jumps to sections', async ({
    page,
  }) => {
    await page.goto(`/blog/${post.slug}`);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();

    /* Whatever the first section is called: click its entry, land on its heading. */
    const first = toc.getByRole('link').first();
    const href = await first.getAttribute('href');
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(String(href))).toBeInViewport();
  });

  // An empty nav landmark helps nobody, so it appears only when there is a neighbour.
  test('shows the siblings nav only when the post has neighbours', async ({
    page,
  }) => {
    await page.goto(`/blog/${post.slug}`);
    await expect(
      page.getByRole('heading', { level: 1, name: post.title }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'More posts' }),
    ).toHaveCount(posts.length > 1 ? 1 : 0);
  });

  // The link is labelled "← /blog"; it used to go to "/".
  test('the back link goes to the archive it names', async ({ page }) => {
    await page.goto(`/blog/${post.slug}`);
    await page.getByRole('link', { name: '← /blog' }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeVisible();
  });

  test('unknown slugs return the styled 404 page', async ({ page }) => {
    const response = await page.goto('/blog/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to the blog' }),
    ).toBeVisible();
  });

  test('completely unmatched URLs hit the catch-all 404', async ({ page }) => {
    const response = await page.goto('/this/never/existed');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
  });
});
