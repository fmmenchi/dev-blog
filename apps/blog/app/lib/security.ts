/**
 * The security headers every HTML response carries.
 *
 * The site had none of these. It could be framed by anyone (clickjacking), it sent the
 * full URL of every page as a referrer to any site linked from it, and nothing bounded
 * what a script could load if one ever got in.
 *
 * They are set on DOCUMENTS. Static assets (fonts, css, js) are served by Cloudflare's
 * asset pipeline, which never reaches this worker — and none of these headers changes
 * anything for a woff2 anyway.
 */

/** A fresh nonce per response. Reused across responses, a nonce is worth nothing. */
export function makeNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

/**
 * @param nonce the nonce given to the inline scripts of this very response. Omit it for
 * a page that runs no script at all (the maintenance page), which then gets
 * `script-src 'none'` — strictly better than a nonce nothing uses.
 */
export function securityHeaders(nonce?: string): Record<string, string> {
  const csp = [
    "default-src 'self'",

    /*
     * React Router's hydration data is an inline <script>. It gets the nonce, so the
     * policy stays free of 'unsafe-inline' for scripts, which is the directive that
     * actually matters.
     */
    nonce ? `script-src 'self' 'nonce-${nonce}'` : "script-src 'none'",

    /*
     * 'unsafe-inline' here is NOT laziness, and it is not the same risk as it would be
     * for scripts. Components set inline style ATTRIBUTES (the avatar's size, the accent
     * swatch's colour), and a nonce cannot cover a style attribute — only a <style>
     * element. The alternatives are hashing every attribute, or moving dynamic values
     * out of the markup, neither of which buys anything: a style attribute cannot
     * exfiltrate data or execute code.
     */
    "style-src 'self' 'unsafe-inline'",

    /* data: because the accent switcher repaints the favicon with a data: URL. */
    "img-src 'self' data:",
    "font-src 'self'",

    /* Client navigations fetch their own .data routes. Nothing else is called. */
    "connect-src 'self'",

    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    /* Redundant with frame-ancestors, and still read by browsers that ignore CSP. */
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    /* Referrers stop at the origin when leaving the site — the path is nobody's business. */
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    /* A blog needs none of these. Saying so is free. */
    'Permissions-Policy':
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}
