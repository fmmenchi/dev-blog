import { expect, test } from '@playwright/test';

test.describe('home', () => {
  test('renders the hero and the post list', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /decisions behind the code/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'I rewrote my blog in 200 lines' }),
    ).toBeVisible();
    await expect(page.getByText('★ latest')).toBeVisible();
  });

  test('navigates from a post card to the article', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('heading', { name: 'I rewrote my blog in 200 lines' })
      .click();
    await expect(page).toHaveURL(/\/blog\/rewrote-my-blog-in-200-lines/);
    await expect(
      page.getByRole('heading', { level: 1, name: /200 lines/ }),
    ).toBeVisible();
  });

  test('skip link jumps to the content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
  });
});
