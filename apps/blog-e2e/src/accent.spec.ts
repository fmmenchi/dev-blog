import { expect, test } from '@playwright/test';

/*
 * The accent is remembered in localStorage — NOT a cookie, because /colophon promises
 * there are none. So the server cannot know it, and the HTML always leaves with
 * `yellow`. A small inline script in the head applies the saved one before the first
 * paint.
 *
 * The failure this guards against is a FLASH: without the script the page paints
 * yellow and only turns lime once React has hydrated. Nothing errors, no test fails —
 * you just see the wrong colour for a moment, on every page, forever.
 */
test.describe('accent', () => {
  test('is remembered, and applied before the page paints', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Change accent color/i }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset['accent']),
      )
      .toBe('lime');

    /*
     * Reload and look at `domcontentloaded` — the head has run, React has NOT. If the
     * accent is already right at that point, no yellow was ever painted.
     */
    const response = await page.goto('/blog', {
      waitUntil: 'domcontentloaded',
    });

    /* The server still says yellow: it has no way to know, and that is the point. */
    expect(await response?.text()).toContain('data-accent="yellow"');
    expect(
      await page.evaluate(() => document.documentElement.dataset['accent']),
    ).toBe('lime');
  });

  test('the inline script carries a nonce, or the CSP would refuse it', async ({
    page,
  }) => {
    await page.goto('/');
    const nonce = await page.evaluate(() =>
      document.querySelector('head script[nonce]')?.getAttribute('nonce'),
    );
    /* Chromium hides the value from the DOM, but the attribute must be present. */
    expect(nonce).not.toBeNull();
  });
});
