import { useEffect, useState } from 'react';

import { cn } from '../../internal/cn';

const ACCENTS = ['yellow', 'lime', 'amber'] as const;
type Accent = (typeof ACCENTS)[number];

/*
 * `-base`, not the old bare name: when the accents became derived, the authored
 * colour was renamed and this swatch kept reading a token that no longer exists.
 * An undefined var() in `background` invalidates the declaration, so the square
 * simply went colourless — and no test could see it, because it is inline style.
 */
const SWATCH: Record<Accent, string> = {
  yellow: 'var(--accent-yellow-base)',
  lime: 'var(--accent-lime-base)',
  amber: 'var(--accent-amber-base)',
};

const STORAGE_KEY = 'fabio-accent';

function isAccent(value: string | null): value is Accent {
  return ACCENTS.includes(value as Accent);
}

/**
 * Cycles the site accent (yellow → lime → amber), persisted per visitor.
 *
 * Deliberately NOT a Radix ToggleGroup: the design calls for a single chip that
 * cycles, not three visible options, and Radix has no primitive for a cycle.
 * What Radix would have given us for free — a status announcement — is done by
 * hand below, because clicking used to change the whole site's colour and tell a
 * screen-reader user nothing at all (WCAG 4.1.3, Status Messages).
 */
export function AccentSwitcher({ className }: { className?: string }) {
  const [accent, setAccent] = useState<Accent>('yellow');
  const [announcement, setAnnouncement] = useState('');

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
    setAnnouncement(`Accent colour changed to ${next}`);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-2.75 py-1.5 font-mono text-2xs text-muted-foreground [transition:var(--transition-color)] hover:border-primary hover:text-foreground',
          className,
        )}
        onClick={cycle}
        title="switch accent"
        aria-label={`Change accent color to ${next}`}
      >
        {/* Decorative: the colour's name is right beside it, so it is not the
            only way to know which one this is (WCAG 1.4.1, Use of Colour). */}
        <span
          aria-hidden="true"
          className="size-2.75 rounded-[3px]"
          style={{ background: SWATCH[next] }}
        />
        {next}
      </button>
      {/* The change is otherwise silent: nothing else on the page says it happened. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
