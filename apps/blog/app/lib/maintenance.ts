/**
 * Maintenance mode: when the worker's MAINTENANCE var is "true", every page
 * answers 503 with a styled curtain. Toggle without touching code:
 *   pnpm nx run blog:maintenance-on   /   blog:maintenance-off
 * or the "Maintenance" GitHub Actions workflow.
 */

export function isMaintenance(env: { MAINTENANCE?: string }): boolean {
  return env.MAINTENANCE === 'true';
}

/**
 * The curtain is self-contained (inline styles mirroring the design tokens)
 * because the app bundle is not rendered in this mode.
 */
export function maintenanceResponse(): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Back soon — fabiomenchicchi.com</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:oklch(21% 0.02 256);color:oklch(95% 0.007 256);
    font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;text-align:center;padding:2rem}
  .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
  .accent{color:oklch(86% 0.16 95)}
  h1{font-size:clamp(1.5rem,4vw,2.25rem);letter-spacing:-0.03em;line-height:1.1;margin:0 0 1rem}
  p{color:oklch(74% 0.014 256);line-height:1.6;margin:0}
  .label{font-size:0.75rem;font-weight:600;margin-bottom:1.5rem}
</style>
</head>
<body>
<main>
  <div class="mono label"><span class="accent">$</span> MAINTENANCE MODE</div>
  <h1>Deploying something <span class="accent">new</span>.</h1>
  <p>The site is down for a moment while I work on it.<br>Grab a coffee — I certainly have.</p>
</main>
</body>
</html>
`;
  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '600',
      'Cache-Control': 'no-store',
    },
  });
}
