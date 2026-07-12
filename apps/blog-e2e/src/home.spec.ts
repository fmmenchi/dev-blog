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
      page.getByRole('heading', { name: 'Starting a notebook' }),
    ).toBeVisible();
    await expect(page.getByText('★ latest')).toBeVisible();
  });

  test('navigates from a post card to the article', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'Starting a notebook' }).click();
    await expect(page).toHaveURL(/\/blog\/starting-a-notebook/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Starting a notebook/ }),
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
