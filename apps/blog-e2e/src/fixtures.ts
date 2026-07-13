import { test as base, type Page } from '@playwright/test';

/*
 * Every spec imports `test` and `expect` from HERE, not from `@playwright/test`.
 *
 * The pages are server-rendered, so the HTML — buttons and all — is on screen
 * long before React has attached a single handler to it. A click in that window
 * lands on inert markup: nothing happens, nothing errors, and the assertion that
 * follows just times out. It is the classic SSR flake, and it is invisible on a
 * warm machine because hydration wins the race; it surfaces on a cold server or
 * a loaded CI runner, which is the worst possible place to first meet it.
 *
 * So `page.goto()` is wrapped to wait for the app to hydrate. The root sets
 * `data-hydrated` on <html> once React takes over (see `app/root.tsx`) — the
 * attribute cannot exist in the SSR response, which is exactly what makes it a
 * trustworthy signal.
 *
 * The wait is best-effort: resource routes (`/rss.xml`, `/sitemap.xml`) never
 * hydrate because they are not the React app at all, so a swallowed timeout is
 * the correct outcome there, not a failure.
 */

const HYDRATION_TIMEOUT_MS = 5000;

/** Wait until the client has hydrated (the root sets `html[data-hydrated]`). */
export const waitForHydration = (page: Page) =>
  page
    .locator('html[data-hydrated="true"]')
    .waitFor({ state: 'attached', timeout: HYDRATION_TIMEOUT_MS });

export const test = base.extend({
  page: async ({ page }, use) => {
    const nativeGoto = page.goto.bind(page);

    page.goto = (async (
      url: string,
      options?: Parameters<typeof nativeGoto>[1],
    ) => {
      const response = await nativeGoto(url, options);
      await waitForHydration(page).catch(() => undefined);
      return response;
    }) as typeof page.goto;

    await use(page);
  },
});

export { expect } from '@playwright/test';
