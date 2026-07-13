import { expect, test } from './fixtures';

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

    await nav.getByRole('link', { name: '/blog' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: '/blog' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  // The home shows the featured post plus four; the archive link appears only when
  // there is a sixth one to go and see. With a single post, promising "all posts"
  // would lead to the same list the reader is already looking at.
  test('the home offers no archive link while it already shows everything', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /all posts/ })).toHaveCount(0);
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
