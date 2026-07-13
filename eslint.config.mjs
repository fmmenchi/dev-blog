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
];
