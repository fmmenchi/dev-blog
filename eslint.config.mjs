import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/build',
      '**/.react-router',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/test-output',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          // Libs are source-only (consumed by the app's bundler), so
          // buildable-dependency enforcement does not apply here.
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              // The design system may reach for an icon — an icon is a
              // presentational primitive, not content. What it must NOT know is
              // WHICH links this blog has, which is why `IconLinks` still takes
              // its items as props. (andes-routes allows the same edge, by
              // tagging its icon lib `type:ui`.)
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:theme', 'type:icons'],
            },
            {
              // Icons depend on nothing. They are leaves.
              sourceTag: 'type:icons',
              onlyDependOnLibsWithTags: [],
            },
            {
              // Build/CI tooling (the Nx plugins) may use the shared utilities, and
              // nothing of the app: a plugin that imported a component would mean the
              // build depended on the thing it builds.
              sourceTag: 'type:tooling',
              onlyDependOnLibsWithTags: ['type:util', 'type:tooling'],
            },
            {
              // Utilities are leaves too — that is what makes them shareable.
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:theme',
              onlyDependOnLibsWithTags: ['type:theme'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  {
    // Stylelint's declaration-strict-value guards the two surviving CSS modules,
    // but almost all styling here is Tailwind utilities in TSX — where no CSS
    // linter looks. This closes that gap for COLOURS: a raw colour inside an
    // arbitrary utility (`bg-[#fff]`, `text-[oklch(…)]`) bypasses the palette,
    // and the design-system rule is that a colour in brackets is a bug. Add the
    // value to the theme and bridge it instead (.agent/design-system.md).
    // '**/*.tsx' and not per-project paths: this block is spread into each
    // project's own flat config, and files globs resolve relative to THAT file.
    files: ['**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/\\[(#[0-9a-fA-F]|oklch\\(|rgba?\\(|hsla?\\()/]',
          message:
            'Raw colour in an arbitrary Tailwind value. Colours come from the theme: add a token to libs/theme and bridge it (see .agent/design-system.md).',
        },
      ],
    },
  },
];
