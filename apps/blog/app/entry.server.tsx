/**
 * Server entry for the Cloudflare Workers runtime: web streams only,
 * no Node APIs. https://reactrouter.com/explanation/special-files#entryservertsx
 */

import type { HandleDocumentRequestFunction } from 'react-router';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';

import { NonceContext } from './lib/nonce';
import { makeNonce, securityHeaders } from './lib/security';

export default async function handleRequest(
  ...[
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
  ]: Parameters<HandleDocumentRequestFunction>
) {
  let shellRendered = false;
  const userAgent = request.headers.get('user-agent');

  /*
   * One nonce, used twice: React Router stamps it on the inline scripts it renders
   * (and forwards it to <Links>/<Scripts> through context, so root.tsx needs no
   * change), and the CSP below allows exactly that nonce. Any other inline script —
   * an injected one — is refused.
   */
  const nonce = makeNonce();

  const body = await renderToReadableStream(
    /* The prop covers React Router's own inline scripts; the context lets root.tsx
       stamp the same nonce on the one it writes itself. */
    <NonceContext.Provider value={nonce}>
      <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
    </NonceContext.Provider>,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell. Shell errors
        // reject the stream and get logged by the framework instead.
        if (shellRendered) {
          console.error(error);
        }
      },
    },
  );
  shellRendered = true;

  // Bots and SPA-mode renders wait for all content before responding.
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  for (const [header, value] of Object.entries(securityHeaders(nonce))) {
    responseHeaders.set(header, value);
  }

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
