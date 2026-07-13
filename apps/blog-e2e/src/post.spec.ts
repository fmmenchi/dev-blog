import { expect, test } from '@playwright/test';

test.describe('article', () => {
  test('shows the table of contents and jumps to sections', async ({
    page,
  }) => {
    await page.goto('/blog/starting-a-notebook');
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();
    await toc.getByRole('link', { name: /01 · What goes here/ }).click();
    await expect(page).toHaveURL(/#what-goes-here$/);
    await expect(
      page.getByRole('heading', { level: 2, name: /What goes here/ }),
    ).toBeInViewport();
  });

  // With a single post there are no neighbours, and an empty nav landmark helps nobody.
  test('hides the siblings nav when a post has no neighbours', async ({
    page,
  }) => {
    await page.goto('/blog/starting-a-notebook');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Starting a notebook' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'More posts' }),
    ).toHaveCount(0);
  });

  // The link is labelled "← /blog"; it used to go to "/".
  test('the back link goes to the archive it names', async ({ page }) => {
    await page.goto('/blog/starting-a-notebook');
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
