import { defineConfig } from 'unlighthouse';

/**
 * Unlighthouse — the site-wide sweep behind `pnpm nx assess blog`.
 *
 * It crawls the PRODUCTION build (miniflare, the same runtime Cloudflare runs),
 * following our own `/sitemap.xml`, and scores every page on performance,
 * accessibility, best practices and SEO.
 *
 * It does not replace the axe gate in `apps/blog-e2e/src/a11y.spec.ts`: axe
 * ASSERTS (no WCAG A/AA violations, or the build fails), this REPORTS (a score
 * and a ranked list of what to look at). One is a gate, the other is a mirror.
 *
 * NB: never add an explicit `urls` list — Unlighthouse turns off sitemap and
 * crawler discovery the moment it is given one, silently shrinking the sweep to
 * those seeds. The sitemap is the source of truth for coverage.
 */
export default defineConfig({
  scanner: {
    sitemap: true,
    /* Crawl in-page links too, so a route missing from the sitemap is still found. */
    crawler: true,
    /* Resource routes and assets are not pages: rss.xml and sitemap.xml have no UI. */
    exclude: ['.*\\.(xml|txt|ico|png|jpe?g|webp|avif|svg|woff2?)$'],
  },
  ci: {
    /* Per-route JSON with the full category scores, at .unlighthouse/ci-result.json */
    reporter: 'jsonExpanded',
  },
});
