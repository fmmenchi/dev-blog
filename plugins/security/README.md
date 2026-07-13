# @dev-blog/security

Trivy, wired into Nx.

```bash
pnpm nx run blog:vuln                    # what the app SHIPS — its production tree
pnpm nx run @dev-blog/security:secrets   # the whole repo — a secret is a secret anywhere
pnpm nx run @dev-blog/security:scan      # both
```

The targets live where they belong: `vuln` on the **app**, because it is the app that
gets scanned and the executor reads the project from the task it runs on. `secrets` is a
workspace concern, so it sits on the plugin.

Trivy is a Go binary, not an npm package, so it cannot be a dependency. The executor uses
it from `PATH` if it is there and Docker otherwise — nothing to install either way.

## The Node warning

Running any target prints:

> Failed to load the ES module: …/executor.ts. Make sure to set "type": "module"…

It is noise, and it cannot be removed without making things worse. Nx loads workspace
plugin executors from their TypeScript **source**, and it maps `dist` back to `src` even
when `executors.json` points at the build — so compiling first does not help. Node tries
ESM, fails, warns, and falls back to CommonJS, which is what an Nx executor must be.

The alternatives are renaming the executors to `.cts`, or making the plugin ESM (which Nx
executors do not support). Both are worse than one line of noise.
