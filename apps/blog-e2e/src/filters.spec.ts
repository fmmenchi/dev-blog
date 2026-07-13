import { expect, test } from '@playwright/test';

/*
 * Only the URL-driven half of the feature is exercised here, and that is not a
 * gap: the blog currently holds one post and one project, so the filter bar
 * correctly refuses to render, and there is no toolbar on the real site to click.
 * The bar's own behaviour — pressed state, toggling, the hide threshold — is
 * covered on a list worth filtering in apps/blog/tests/components/filter-bar.spec.tsx.
 *
 * What e2e is uniquely able to prove is the part that has to work with no
 * JavaScript at all: that the SERVER filters.
 */
test.describe('filters', () => {
  test('a URL alone filters the list — no JavaScript required', async ({
    page,
  }) => {
    await page.goto('/blog?tag=meta');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Starting a notebook' }),
    ).toBeVisible();

    await page.goto('/blog?tag=does-not-exist');
    await expect(page.getByText('Nothing with those tags')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Starting a notebook' }),
    ).toHaveCount(0);
  });

  test('projects filter by language', async ({ page }) => {
    await page.goto('/projects?language=TypeScript');
    await expect(
      page.getByRole('heading', { level: 2, name: 'dev-blog' }),
    ).toBeVisible();

    await page.goto('/projects?language=Rust');
    await expect(page.getByText('Nothing in that language')).toBeVisible();
  });
});
