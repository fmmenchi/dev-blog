import { useEffect, useState } from 'react';

import { cn } from '../../internal/cn';

/* Exported so the no-flash script in the document head can use the SAME key and the
   SAME names. A second copy of 'fabio-accent' somewhere else is a bug waiting for the
   day one of them is renamed. */
export const ACCENTS = ['yellow', 'lime', 'amber'] as const;
export type Accent = (typeof ACCENTS)[number];

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

export const ACCENT_STORAGE_KEY = 'fabio-accent';

function isAccent(value: string | null): value is Accent {
  return ACCENTS.includes(value as Accent);
}

/**
 * Repaint the favicon in the current accent.
 *
 * A favicon cannot do this itself. The browser renders it in an isolated image
 * context: it never sees the page's DOM, so `data-accent` and our custom
 * properties are invisible to it, and scripts inside a favicon SVG are disabled.
 * An SVG favicon CAN follow `prefers-color-scheme` — the OS theme — but not a
 * site-level accent. So the only way is from the outside: rebuild the icon and
 * swap the <link>.
 *
 * The colours are read from the live computed styles rather than hardcoded, so
 * this cannot drift from the theme — the fourth rule of this codebase, learned
 * expensively.
 */
function paintFavicon() {
  const styles = getComputedStyle(document.documentElement);
  const fill = styles.getPropertyValue('--color-primary').trim();
  const background = styles.getPropertyValue('--color-background').trim();
  if (!fill || !background) return;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><text x="32" y="46" font-family="'JetBrains Mono', ui-monospace, monospace" font-weight="700" font-size="42" text-anchor="middle" fill="${fill}">F</text></svg>`;

  const link =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'icon' }),
    );
  link.type = 'image/svg+xml';
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
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
    const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if (isAccent(saved)) setAccent(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset['accent'] = accent;
    paintFavicon();
  }, [accent]);

  const next = ACCENTS[(ACCENTS.indexOf(accent) + 1) % ACCENTS.length];

  const cycle = () => {
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
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
          'inline-flex cursor-pointer items-center gap-2 rounded-md border bg-transparent px-2.75 py-1.5 font-mono text-2xs text-muted-foreground [transition:var(--transition-color)] hover:text-foreground',
          className,
        )}
        /*
         * The border is the colour the button is OFFERING, the same one as the swatch
         * and the word beside it. It used to be `border-border` — the separator grey,
         * 1.18:1 against the background — so the control had no visible edge at all,
         * and only found one on hover, which a phone does not have.
         *
         * Inline, because the value depends on state; a class list cannot hold three
         * accents. It is the same token the swatch reads, so the two can never drift.
         */
        style={{ borderColor: SWATCH[next] }}
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
