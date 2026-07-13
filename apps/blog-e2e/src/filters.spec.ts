import { expect, test } from './fixtures';

import { firstPost } from './support/content';

const post = firstPost();

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
    /* Filter by a tag the post really carries, whatever it happens to be. */
    await page.goto(`/blog?tag=${post.tags[0]}`);
    await expect(
      page.getByRole('heading', { level: 2, name: post.title }),
    ).toBeVisible();

    await page.goto('/blog?tag=does-not-exist');
    await expect(page.getByText('Nothing with those tags')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: post.title }),
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
