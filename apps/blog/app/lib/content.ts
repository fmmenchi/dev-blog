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
    status: 'attivo',
    description:
      'Generatore di feed RSS type-safe. Lo schema del feed è un tipo, gli errori sono a compile time.',
    language: 'Rust',
    url: '#',
  },
  {
    name: 'tempo',
    period: '2025',
    status: 'stabile',
    description:
      'Time tracker da terminale. Un comando per iniziare, uno per fermare, un report a fine settimana.',
    language: 'Go',
    url: '#',
  },
  {
    name: 'quaderno',
    period: '2025',
    status: 'in pausa',
    description:
      "Note locali-first con sync CRDT. L'esperimento che mi ha insegnato perché il sync è difficile.",
    language: 'TypeScript',
    url: '#',
  },
  {
    name: 'dotfiles',
    period: 'sempre',
    status: 'in evoluzione',
    description:
      'Neovim, tmux, zsh. La config è documentazione: ogni riga ha un perché scritto accanto.',
    language: 'Lua',
    url: '#',
  },
];

export const profile = {
  name: 'Fabio',
  role: 'full-stack developer',
  location: 'Torino, IT',
  experience: '~10 anni di codice',
  bioShort:
    'Full-stack dev a Torino. Di giorno sistemi distribuiti, di notte questo blog.',
  bioCard: 'Full-stack dev a Torino. Scrive di sistemi, tipi e decisioni.',
  skills: ['TypeScript', 'Rust', 'Architettura', 'DX'],
  building: 'Generatore di feed RSS type-safe in Rust',
  buildingProgress: 80,
};
