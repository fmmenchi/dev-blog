import { Container, Link } from '@dev-blog/ui';

import { SectionHeading } from '../components/section-heading';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';

export const meta = ({
  matches,
  location,
}: {
  matches: ({ id: string; loaderData?: unknown } | undefined)[];
  location: { pathname: string };
}) =>
  seoMeta({
    origin: originFromMatches(matches),
    path: location.pathname,
    title: `Uses — ${SITE_NAME}`,
    description: 'The tools I actually work with, updated occasionally.',
  });

interface Row {
  term: string;
  detail: string;
}

/**
 * Phone: the term sits on its own line above the detail. From `sm` the pair
 * becomes the two-column definition row of the desktop design.
 */
const ROW =
  'grid grid-cols-1 items-baseline gap-0.5 sm:grid-cols-[10rem_1fr] sm:gap-4';

function Rows({ rows }: { rows: Row[] }) {
  return (
    <dl className="flex flex-col gap-2">
      {rows.map(({ term, detail }) => (
        <div key={term} className={ROW}>
          <dt className="font-mono text-xs text-primary">{term}</dt>
          <dd className="text-sm leading-copy text-foreground">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Uses() {
  return (
    <Container as="main" width="measure" className="pt-14 pb-18">
      <h1 className="mb-3.5 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
        Uses
      </h1>
      <p className="mb-10 text-base leading-copy text-muted-foreground">
        The tools I actually work with, updated occasionally. Inspired by{' '}
        <Link href="https://uses.tech">uses.tech</Link>.
      </p>

      <section className="mb-8" aria-label="Editor and terminal">
        <div className="mb-4">
          <SectionHeading>editor &amp; terminal</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'editor',
              detail:
                'VS Code, with ESLint, Prettier, Nx Console, Git Graph — and Claude Code doing a good share of the typing.',
            },
            {
              term: 'terminal',
              detail:
                'The one macOS ships with, zsh and oh-my-zsh on top. I never got around to changing it.',
            },
            {
              term: 'font',
              detail: "The editor default. I've never felt the need to argue.",
            },
          ]}
        />
      </section>

      <section className="mb-8" aria-label="Hardware">
        <div className="mb-4">
          <SectionHeading>hardware</SectionHeading>
        </div>
        <Rows
          rows={[
            {
              term: 'machine',
              detail: 'MacBook Pro 16" — Apple M5 Pro, 48 GB.',
            },
            {
              term: 'displays',
              detail:
                'A curved LG 34WQ75C-B ultrawide, and a 24" Samsung ViewFinity S6 turned vertical for the code.',
            },
            {
              term: 'dock',
              detail:
                'Anker Prime TB5 — Thunderbolt 5, fourteen ports, one cable to the laptop.',
            },
            {
              term: 'keyboard',
              detail:
                'NuPhy Air V3 — low-profile mechanical, and yes, audible.',
            },
            { term: 'mouse', detail: 'Logitech MX Vertical.' },
            {
              term: 'arm',
              detail: 'North Bayou H180 — both screens float, the desk stays.',
            },
            { term: 'webcam', detail: 'Logitech C930e.' },
            { term: 'speakers', detail: 'Creative Pebble V3.' },
          ]}
        />
      </section>

      <section className="mb-8" aria-label="Toolchain">
        <div className="mb-4">
          <SectionHeading>toolchain</SectionHeading>
        </div>
        <Rows
          rows={[
            { term: 'runtime', detail: 'Node 24 and pnpm, in Nx monorepos.' },
            {
              term: 'also on the machine',
              detail: 'Go, the JDK, Docker and Xcode — the work decides which.',
            },
            {
              term: 'cloud',
              detail: 'Google Cloud, driven with gcloud and Terraform.',
            },
          ]}
        />
      </section>

      <section className="mb-8" aria-label="Apps and services">
        <div className="mb-4">
          <SectionHeading>apps &amp; services</SectionHeading>
        </div>
        <Rows
          rows={[
            { term: 'notes', detail: 'Notion.' },
            {
              term: 'code hosting',
              detail: 'GitHub for mine, GitLab at work.',
            },
            { term: 'music', detail: 'Spotify, while writing.' },
          ]}
        />
      </section>
    </Container>
  );
}
