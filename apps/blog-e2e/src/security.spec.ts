import { expect, test } from '@playwright/test';

/*
 * A unit test can only prove the header STRING is right. These prove it actually
 * reaches the browser, and — more importantly — that the policy does not break the
 * site: a CSP that blocks React Router's hydration script fails silently, leaving a
 * page that renders perfectly and responds to nothing.
 */
test.describe('security headers', () => {
  test('the document is locked down', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');

    const csp = headers['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    /* A per-response nonce, not a blanket 'unsafe-inline'. */
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+'/);
  });

  test('a fresh nonce per response', async ({ page }) => {
    const first = (await page.goto('/'))?.headers()['content-security-policy'];
    const second = (await page.goto('/blog'))?.headers()[
      'content-security-policy'
    ];
    expect(first).not.toBe(second);
  });

  test('and the policy does not break the page', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text())) {
        violations.push(message.text());
      }
    });

    await page.goto('/');

    /* The accent switcher is client-only: if the scripts were refused, it is dead.
       Its working is the proof that hydration survived the policy. */
    const before = await page.evaluate(
      () => document.documentElement.dataset['accent'],
    );
    await page.getByRole('button', { name: /Change accent color/i }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset['accent']),
      )
      .not.toBe(before);

    expect(violations).toEqual([]);
  });
});
