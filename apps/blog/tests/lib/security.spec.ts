import { makeNonce, securityHeaders } from '../../app/lib/security';

describe('makeNonce', () => {
  it('is different every time', () => {
    /* A nonce reused across responses is not a nonce — it is a password an attacker
       reads off the previous page. */
    const nonces = new Set(Array.from({ length: 50 }, () => makeNonce()));
    expect(nonces.size).toBe(50);
  });
});

describe('securityHeaders', () => {
  const csp = (nonce?: string) =>
    securityHeaders(nonce)['Content-Security-Policy'] ?? '';

  it('allows only the nonce it was given to run a script', () => {
    expect(csp('abc123')).toContain("script-src 'self' 'nonce-abc123'");
    /* The directive that actually matters: an injected inline script must be refused. */
    expect(csp('abc123')).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  it('forbids scripts outright on a page that has none', () => {
    expect(csp()).toContain("script-src 'none'");
  });

  it('allows inline STYLES, which are attributes and cannot take a nonce', () => {
    /* The avatar's size and the accent swatch are style attributes. A style attribute
       can neither execute code nor exfiltrate data — this is not the script hole. */
    expect(csp('n')).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('lets the favicon be repainted from a data: URL', () => {
    /* The accent switcher rewrites the favicon at runtime. Without data: it silently
       stops working — which is exactly the kind of failure this site keeps having. */
    expect(csp('n')).toContain("img-src 'self' data:");
  });

  it('refuses to be framed, and keeps the path out of referrers', () => {
    const headers = securityHeaders('n');
    expect(csp('n')).toContain("frame-ancestors 'none'");
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('loads nothing from anywhere but this origin', () => {
    /* The fonts came from Google once. They will not come back by accident. */
    const policy = csp('n');
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("font-src 'self'");
    expect(policy).toContain("connect-src 'self'");
    expect(policy).not.toMatch(/https?:\/\//);
  });
});
