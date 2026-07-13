import { expect, test } from './fixtures';

import { firstPost } from './support/content';

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
      page.getByRole('heading', { name: firstPost().title }),
    ).toBeVisible();
    await expect(page.getByText('★ latest')).toBeVisible();
  });

  test('navigates from a post card to the article', async ({ page }) => {
    await page.goto('/');
    const post = firstPost();
    await page.getByRole('heading', { name: post.title }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${post.slug}`));
    await expect(
      page.getByRole('heading', { level: 1, name: post.title }),
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
