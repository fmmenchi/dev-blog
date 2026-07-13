# Security — agent rules

Read this before touching `entry.server.tsx`, `workers/app.ts`, `wrangler.jsonc`, or
adding anything that loads from a domain we do not own.

## The headers

Every HTML response carries them; they are built in one place,
`apps/blog/app/lib/security.ts`, and used by the document response and the maintenance
page. The site shipped with **none** of them.

- **CSP with a per-response nonce.** React Router's hydration data is an inline
  `<script>`. `entry.server.tsx` mints a nonce, passes it to `<ServerRouter nonce>` —
  which forwards it to `<Links>`/`<Scripts>` through context, so `root.tsx` needs no
  change — and allows exactly that nonce. **Never** reach for `script-src
'unsafe-inline'` to make something work; that is the one directive that matters.
- **`style-src 'self' 'unsafe-inline'` is deliberate**, and it is not the same
  concession. Components set inline style _attributes_ (the avatar's size, the accent
  swatch), and a nonce cannot cover an attribute — only a `<style>` element. A style
  attribute cannot execute code or exfiltrate data.
- `img-src` includes `data:` because the accent switcher repaints the favicon with a
  data URL. Remove it and that silently stops working.
- A page with no scripts (maintenance) gets `script-src 'none'` — pass no nonce.

`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy`, COOP and CORP come with them.

## A CSP fails silently. Verify it in a browser.

A wrong policy does not error: it blocks the hydration script, and you get a page that
renders perfectly and responds to nothing. `curl` cannot see this. Neither can a unit
test, which only proves the header _string_.

`apps/blog-e2e/src/security.spec.ts` clicks the accent switcher — a client-only control
— and asserts the accent actually changed, with zero CSP violations in the console.
**If you change the policy, that test is the proof.** Run it.

## No third-party origins

`default-src 'self'`, and nothing in the policy contains `http`. The fonts came from
Google once, which cost 0.7s of first paint and made /colophon's "no tracking" promise
untrue. They will not come back by accident — see [performance](./performance.md).

## The Worker

`workers_dev: false` in `wrangler.jsonc`. With it on, the site also answers on
`*.workers.dev`: a second, fully indexable origin serving the same pages behind the same
`Allow: /` robots.txt. The apex is the only hostname this site has.

The maintenance flag lives in KV, so a deploy can never flip it. **Never toggle
production maintenance without being asked to.**
