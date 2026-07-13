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
  building: 'this blog — rewriting it in the open',
  buildingProgress: 70,
};
