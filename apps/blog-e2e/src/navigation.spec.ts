import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __spaMarker?: boolean;
  }
}

test.describe('navigation', () => {
  test('internal navigation is client-side — no full reloads', async ({
    page,
  }) => {
    await page.goto('/');
    // A full document reload would wipe this marker.
    await page.evaluate(() => {
      window.__spaMarker = true;
    });

    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: '/projects' }).click();
    await expect(page).toHaveURL(/\/projects$/);

    const footer = page.getByRole('navigation', { name: 'Secondary' });
    await footer.getByRole('link', { name: 'colophon' }).click();
    await expect(page).toHaveURL(/\/colophon$/);
    await footer.getByRole('link', { name: 'uses' }).click();
    await expect(page).toHaveURL(/\/uses$/);

    expect(await page.evaluate(() => window.__spaMarker)).toBe(true);
  });

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
