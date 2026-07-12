import { useEffect, useState } from 'react';

const ACCENTS = ['yellow', 'lime', 'amber'] as const;
type Accent = (typeof ACCENTS)[number];

const SWATCH: Record<Accent, string> = {
  yellow: 'var(--accent-yellow)',
  lime: 'var(--accent-lime)',
  amber: 'var(--accent-amber)',
};

const STORAGE_KEY = 'fabio-accent';

function isAccent(value: string | null): value is Accent {
  return ACCENTS.includes(value as Accent);
}

/** Cycles the site accent (yellow → lime → amber), persisted per visitor. */
export function AccentSwitcher() {
  const [accent, setAccent] = useState<Accent>('yellow');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isAccent(saved)) setAccent(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset['accent'] = accent;
  }, [accent]);

  const next = ACCENTS[(ACCENTS.indexOf(accent) + 1) % ACCENTS.length];

  const cycle = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // persistence is best-effort
    }
    setAccent(next);
  };

  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-2.75 py-1.5 font-mono text-2xs text-muted-foreground [transition:var(--transition-color)] hover:border-primary hover:text-foreground"
      onClick={cycle}
      title="switch accent"
      aria-label={`Change accent color to ${next}`}
    >
      <span
        aria-hidden="true"
        className="size-2.75 rounded-[3px]"
        style={{ background: SWATCH[next] }}
      />
      {next}
    </button>
  );
}
