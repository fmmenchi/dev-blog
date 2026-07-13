/**
 * Which build of the site you are actually looking at.
 *
 * The two values are inlined by Vite at build time (see the `define` block in
 * `vite.config.mts`), so this is a compile-time constant in BOTH bundles — the worker
 * renders the same string the browser hydrates, with no loader and nothing to
 * serialise into the document.
 *
 * They must be read as literal `import.meta.env.VITE_*` member expressions: `define` is
 * a textual substitution, and a dynamic lookup (`import.meta.env[key]`) would survive
 * into the bundle as a runtime read of an object that does not exist there.
 */
export interface BuildInfo {
  /** The released version, from the git tag `v{version}`. `dev` outside a repo. */
  version: string;
  /** Short commit hash. Empty when git could not be asked. */
  commit: string;
}

export function getBuildInfo(): BuildInfo {
  return {
    version: import.meta.env.VITE_APP_VERSION ?? 'dev',
    commit: import.meta.env.VITE_GIT_HASH ?? '',
  };
}
