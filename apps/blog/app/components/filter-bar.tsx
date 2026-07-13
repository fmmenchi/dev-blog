import { Select, ToggleGroup, ToggleGroupItem } from '@dev-blog/ui';
import { useSearchParams } from 'react-router';

import {
  hasAnythingToFilter,
  SORT_OPTIONS,
  type SortOrder,
} from '../lib/filters';

export interface FilterBarProps {
  /** The query-string key the facets live under, e.g. `tag`. */
  param: string;
  /** Names the toolbar for assistive tech, e.g. "Filter by tag". */
  label: string;
  /** Every available facet. */
  facets: string[];
  /** The currently selected ones, straight from the URL. */
  selected: string[];
  sort: SortOrder;
  /** Names the sort control, e.g. "Sort posts". */
  sortLabel: string;
  /** Rendered before each facet, e.g. `#`. */
  prefix?: string;
  /** How many items the list holds. Below two, sorting is theatre. */
  itemCount: number;
}

/**
 * Tag filters and a sort order, both written into the URL.
 *
 * Every change is a navigation, so the loader re-runs and the SERVER does the
 * filtering: the list that arrives is already the right one. React state would
 * paint everything first and then shrink, and would leave the URL lying about
 * what is on screen.
 *
 * `replace` on navigation, deliberately: toggling five tags should not put five
 * entries in the history and make Back feel broken.
 */
export function FilterBar({
  param,
  label,
  facets,
  selected,
  sort,
  sortLabel,
  prefix = '',
  itemCount,
}: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const update = (next: URLSearchParams) =>
    setSearchParams(next, { replace: true, preventScrollReset: true });

  const onFacetsChange = (values: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(param);
    for (const value of values) next.append(param, value);
    update(next);
  };

  const onSortChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    /* `newest` is the default: keep it out of the URL rather than say it twice. */
    if (value === 'newest') next.delete('sort');
    else next.set('sort', value);
    update(next);
  };

  /* Also checked by the caller before it loads this chunk — see filter-bar.lazy. */
  if (!hasAnythingToFilter(facets, itemCount)) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <ToggleGroup
        label={label}
        value={selected}
        onValueChange={onFacetsChange}
      >
        {facets.map((facet) => (
          <ToggleGroupItem key={facet} value={facet}>
            {prefix}
            {facet}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select
        label={sortLabel}
        value={sort}
        onValueChange={onSortChange}
        options={SORT_OPTIONS}
      />
    </div>
  );
}
