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
    name: 'rss-gen',
    period: '2026',
    status: 'active',
    description:
      'Type-safe RSS feed generator. The feed schema is a type, the errors are compile-time.',
    language: 'Rust',
    url: '#',
  },
  {
    name: 'tempo',
    period: '2025',
    status: 'stable',
    description:
      'Terminal time tracker. One command to start, one to stop, a report at the end of the week.',
    language: 'Go',
    url: '#',
  },
  {
    name: 'quaderno',
    period: '2025',
    status: 'paused',
    description:
      'Local-first notes with CRDT sync. The experiment that taught me why sync is hard.',
    language: 'TypeScript',
    url: '#',
  },
  {
    name: 'dotfiles',
    period: 'always',
    status: 'evolving',
    description:
      'Neovim, tmux, zsh. The config is documentation: every line has its why written next to it.',
    language: 'Lua',
    url: '#',
  },
];

export const profile = {
  name: 'Fabio',
  role: 'full-stack developer',
  location: 'Turin, IT',
  experience: '~10 years of code',
  bioShort:
    'Full-stack dev in Turin. Distributed systems by day, this blog by night.',
  bioCard:
    'Full-stack dev in Turin. Writes about systems, types and decisions.',
  skills: ['TypeScript', 'Rust', 'Architecture', 'DX'],
  building: 'Type-safe RSS feed generator in Rust',
  buildingProgress: 80,
};
