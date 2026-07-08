import { expect, test } from '@playwright/test';

test.describe('navigation', () => {
  test('reaches projects and about, marking the active section', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });

    await nav.getByRole('link', { name: '/projects' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: '/projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await nav.getByRole('link', { name: '/about' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: /Hi, I'm Fabio/ }),
    ).toBeVisible();
  });

  test('cycles and persists the accent', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-accent', 'yellow');
    await page.getByRole('button', { name: /Change accent color/ }).click();
    await expect(html).toHaveAttribute('data-accent', 'lime');
    await page.reload();
    await expect(html).toHaveAttribute('data-accent', 'lime');
  });
});
