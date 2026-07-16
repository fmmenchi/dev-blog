/*
 * The code-highlighting theme — the ONE place the snippets' look is decided.
 *
 * Shiki colours at build time (no browser, no client JS). It wants concrete colours, not
 * `var()`, so — like the mermaid theme — we give it sentinels and map each to a token with
 * `colorReplacements`. The output is inlined in the page, so the tokens are live: the code
 * follows the dark theme and the accent switch.
 *
 * Deliberately restrained, to sit inside the site's neutrals-plus-one-accent palette:
 * comments recede (muted), the structural words pop (accent), everything else is plain
 * foreground. No rainbow.
 */

const S = {
  fg: '#d0d0d1',
  muted: '#d0d0d2',
  accent: '#d0d0d3',
  bg: '#d0d0d4',
  string: '#d0d0d5',
};

export const colorReplacements = {
  [S.fg]: 'var(--color-code-foreground)',
  [S.muted]: 'var(--color-muted-foreground)',
  [S.accent]: 'var(--color-primary)',
  [S.bg]: 'var(--color-code-background)',
  /* Strings get one sober extra hue — a muted teal — so JSON/config values read apart
     from keys without a rainbow. Its own token, `--color-code-string`; it does not follow
     the accent (only the structural words do). */
  [S.string]: 'var(--color-code-string)',
};

/** A minimal TextMate theme: three roles, mapped to tokens above. */
export const shikiTheme = {
  name: 'dev-blog',
  type: 'dark',
  colors: {
    'editor.background': S.bg,
    'editor.foreground': S.fg,
  },
  fg: S.fg,
  bg: S.bg,
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: S.muted },
    },
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'storage.type',
        'storage.modifier',
        'constant.language',
        'variable.language',
        'support.type.primitive',
        'entity.name.tag',
        'support.type.property-name', // JSON keys
        'meta.object-literal.key',
      ],
      settings: { foreground: S.accent },
    },
    {
      /* String literals and their JSON values. A more specific property-name scope above
         still wins for JSON keys, so keys stay accent and values turn teal. */
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: S.string },
    },
  ],
};
