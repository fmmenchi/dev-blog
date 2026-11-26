/**
 * Non-post content from the design mocks ("Blog design chat" on
 * claude.ai/design). Posts live as Markdown in `content/posts/`.
 */

export interface Project {
  name: string;
  period: string;
  status: string;
  description: string;
  language: string;
  url: string;
}

export const projects: Project[] = [
  {
    name: 'dev-blog',
    period: '2026',
    status: 'active',
    description:
      'The site you are reading. React Router in an Nx monorepo, with its own design tokens and component library.',
    language: 'TypeScript',
    url: 'https://github.com/fmmenchi/dev-blog',
  },
  {
    name: 'shared-platform',
    period: '2026',
    status: 'active',
    description:
      'The shared layers behind my other services — UI and design tokens, analytics, signing, CI plugins — fifteen packages in one monorepo, each released on its own.',
    language: 'TypeScript',
    url: 'https://github.com/fmmenchi/shared-platform',
  },
  {
    name: 'tokenmeter',
    period: '2026',
    status: 'active',
    description:
      'A macOS menu-bar app and widget that shows how much of my Claude and ChatGPT plan quota is left. It reads only the files Claude Code and the Codex CLI leave on the machine.',
    language: 'Swift',
    url: 'https://github.com/fmmenchi/tokenmeter',
  },
  {
    name: 'devmate',
    period: '2026',
    status: 'active',
    description:
      'A local assistant that takes a GitHub issue through agents — triage, plan, implement, verify, review — to a draft pull request, and grades the result against my own rubric. A human merges, always.',
    language: 'JavaScript',
    url: 'https://github.com/fmmenchi/devmate',
  },
  {
    name: 'ai-skills',
    period: '2026',
    status: 'active',
    description:
      'My agent setup, independent of the tool: the operating contract every repository inherits, plus the few skills no vendor can write for me. Installed by symlink, so one edit reaches every tool.',
    language: 'Shell',
    url: 'https://github.com/fmmenchi/ai-skills',
  },
];

export interface Social {
  label: string;
  href: string;
}

/** The one list of places to find Fabio: the footer and both profile cards read it. */
/** Written once. Anything that needs a mailto builds it from here. */
export const email = 'f.menchicchi@gmail.com';

export const socials: Social[] = [
  { label: 'github', href: 'https://github.com/fmmenchi' },
  {
    label: 'linkedin',
    href: 'https://www.linkedin.com/in/fabio-menchicchi-055a36176/',
  },
  { label: 'mail', href: `mailto:${email}` },
];

export const profile = {
  name: 'Fabio',
  role: 'full stack engineer',
  location: 'Cusco, PE',
  experience: '~13 years of code',
  bioShort:
    'Full stack engineer in Cusco, Peru. Apps and backends by day, this blog by night.',
  bioCard:
    'Full stack engineer in Cusco, Peru. Writes about architecture, tooling and developer experience.',
  skills: [
    'TypeScript',
    'React & React Native',
    'Node & Nest',
    'Go & Java',
    'GCP',
    'Nx',
    'Architecture',
    'DX',
    'AI',
  ],
  building: 'the next post — Nx and TypeScript project references',
  buildingProgress: 20,
};
