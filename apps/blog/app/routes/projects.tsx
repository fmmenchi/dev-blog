import { Card, Container, EmptyState, Link } from '@dev-blog/ui';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';

import { FilterBar } from '../components/filter-bar.lazy';
import { byPeriod, facetsOf, matchesAny, readFilters } from '../lib/filters';

import { projects } from '../lib/content';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';

export function loader({ request }: LoaderFunctionArgs) {
  /* Projects have no tags — they have a language, which is real data rather than
     metadata invented to make a filter look busy. */
  const { selected, sort } = readFilters(new URL(request.url), 'language');

  return {
    items: byPeriod(
      projects.filter((project) => matchesAny([project.language], selected)),
      sort,
    ),
    languages: facetsOf(projects, (project) => [project.language]),
    selected,
    sort,
    total: projects.length,
  };
}

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
    title: `Projects — ${SITE_NAME}`,
    description:
      'Things I build to understand how they work. Almost all open source, almost none finished.',
  });

/** Unlisted languages fall back to the muted dot. */
const LANGUAGE_COLOR: Record<string, string> = {
  TypeScript: 'oklch(70% 0.13 250)',
  Go: 'oklch(75% 0.15 130)',
};

export default function Projects() {
  const { items, languages, selected, sort, total } =
    useLoaderData<typeof loader>();
  const filtered = selected.length > 0;

  return (
    <Container as="main" className="pt-14 pb-18">
      <h1 className="mb-3.5 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
        Projects
      </h1>
      <p className="mb-10 max-w-[35rem] text-base leading-copy text-muted-foreground">
        Things I build to understand how they work. Almost all open source,
        almost none finished.
      </p>

      <div className="mb-8">
        <FilterBar
          param="language"
          label="Filter by language"
          facets={languages}
          selected={selected}
          sort={sort}
          sortLabel="Sort projects"
          itemCount={total}
        />
        {/* A filter that changes the list silently is invisible to a screen
            reader (WCAG 4.1.3). */}
        <p role="status" aria-live="polite" className="sr-only">
          {filtered
            ? `${items.length} of ${total} projects match`
            : `${total} projects`}
        </p>
      </div>

      {items.length === 0 ? (
        filtered ? (
          <EmptyState
            title="Nothing in that language"
            description="No project here uses it. Unpick the filter and the list comes back."
          />
        ) : (
          <EmptyState
            title="No projects yet"
            description="Nothing here I'd ask you to read. When there is, it lands here first."
          >
            <Link href="https://github.com/fmmenchi">github</Link>
          </EmptyState>
        )
      ) : (
        // Phone: one card per row. Two columns from `md`.
        <ul
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          aria-label="Projects"
        >
          {items.map((project) => (
            <li key={project.name}>
              <Link
                href={project.url}
                variant="plain"
                className="group block h-full text-inherit no-underline"
              >
                <Card
                  as="article"
                  interactive
                  className="flex h-full flex-col gap-3"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-mono text-lg font-bold text-primary [transition:var(--transition-color)] group-hover:text-primary-hover">
                      {project.name}
                    </h2>
                    <span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
                      {project.period} · {project.status}
                    </span>
                  </div>
                  <p className="flex-1 text-[14.5px] leading-copy text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="size-2.25 rounded-full"
                      style={{
                        background:
                          LANGUAGE_COLOR[project.language] ??
                          'var(--color-muted-foreground)',
                      }}
                    />
                    {project.language}
                    <span className="ml-auto text-primary">repo →</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
