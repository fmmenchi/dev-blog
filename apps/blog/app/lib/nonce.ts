import { createContext, useContext } from 'react';

/**
 * The CSP nonce of the response being rendered.
 *
 * `entry.server` mints it and gives it to `<ServerRouter nonce>`, which covers the
 * inline scripts React Router writes itself. But OUR inline script — the one in the
 * document head that applies the saved accent before the first paint — is written by
 * `root.tsx`, which has no way to reach into the server entry. Hence a context: the
 * server entry provides it, the head consumes it.
 *
 * On the CLIENT it is the empty string, and that is correct: by then the script has
 * long since run, and the browser enforces the nonce only against the HTML it parsed.
 */
export const NonceContext = createContext('');

export const useNonce = () => useContext(NonceContext);
