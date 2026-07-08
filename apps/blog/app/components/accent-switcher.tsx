import { useEffect, useState } from 'react';

import styles from './accent-switcher.module.css';

const ACCENTS = ['giallo', 'lime', 'ambra'] as const;
type Accent = (typeof ACCENTS)[number];

const SWATCH: Record<Accent, string> = {
  giallo: 'var(--accent-giallo)',
  lime: 'var(--accent-lime)',
  ambra: 'var(--accent-ambra)',
};

const STORAGE_KEY = 'fabio-accent';

function isAccent(value: string | null): value is Accent {
  return ACCENTS.includes(value as Accent);
}

/** Cycles the site accent (giallo → lime → ambra), persisted per visitor. */
export function AccentSwitcher() {
  const [accent, setAccent] = useState<Accent>('giallo');

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
      className={styles['switcher']}
      onClick={cycle}
      title="cambia accento"
      aria-label={`Cambia colore accento in ${next}`}
    >
      <span
        aria-hidden="true"
        className={styles['swatch']}
        style={{ background: SWATCH[next] }}
      />
      {next}
    </button>
  );
}
