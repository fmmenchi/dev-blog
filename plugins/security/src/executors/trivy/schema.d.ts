export interface TrivyExecutorSchema {
  scanners?: ('vuln' | 'secret' | 'misconfig' | 'license')[];
  severity?: ('UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  ignoreUnfixed?: boolean;
  includeDevDeps?: boolean;
  skipDirs?: string[];
  runner?: 'auto' | 'docker' | 'binary';
  /** Scan what this app ships, rather than the workspace toolbox. */
  project?: string;
}
