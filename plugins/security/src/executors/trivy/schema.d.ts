export interface TrivyExecutorSchema {
  scanners?: ('vuln' | 'secret' | 'misconfig' | 'license')[];
  severity?: ('UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  ignoreUnfixed?: boolean;
  includeDevDeps?: boolean;
  skipDirs?: string[];
  runner?: 'auto' | 'docker' | 'binary';
  /**
   * Which app's shipped tree to scan. Defaults to the project the task runs on, so
   * `nx run blog:vuln` needs no options. Pass `null` to scan the real workspace tree
   * instead — a secret is a secret wherever it sits.
   */
  project?: string | null;
}
