import { expect, test } from '@playwright/test';

test.describe('article', () => {
  test('shows the table of contents and jumps to sections', async ({
    page,
  }) => {
    await page.goto('/blog/rewrote-my-blog-in-200-lines');
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();
    await toc.getByRole('link', { name: /02 · The solution/ }).click();
    await expect(page).toHaveURL(/#the-solution$/);
    await expect(
      page.getByRole('heading', { level: 2, name: /The solution/ }),
    ).toBeInViewport();
  });

  test('walks to the previous article', async ({ page }) => {
    await page.goto('/blog/rewrote-my-blog-in-200-lines');
    await page.getByRole('link', { name: /previous/ }).click();
    await expect(page).toHaveURL(/\/blog\/why-i-left-microservices/);
  });

  test('unknown slugs return the styled 404 page', async ({ page }) => {
    const response = await page.goto('/blog/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: /doesn't exist/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '← back to the blog' }),
    ).toBeVisible();
  });

  test('completely unmatched URLs hit the catch-all 404', async ({ page }) => {
    const response = await page.goto('/this/never/existed');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: /doesn't exist/ }),
    ).toBeVisible();
  });
});
