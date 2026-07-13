/// <reference types="vite/client" />

/**
 * Typed so `getBuildInfo()` reads two strings and not `any` — Vite's own
 * `ImportMetaEnv` carries an index signature, which would let a typo through.
 * Both are written by the `define` block in `vite.config.mts`.
 */
interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_GIT_HASH?: string;
}
