/**
 * Filtering and sorting, read from the URL.
 *
 * The URL is the state. Not React state: a filtered list must be shareable, must
 * survive a refresh, and must be applied by the SERVER — otherwise the first
 * paint shows everything and then flickers down to the selection, and a crawler
 * (or anyone with JS off) sees a filter that never happened.
 */

export type SortOrder = 'newest' | 'oldest';

export interface FilterState {
  /** Selected facets. Empty means "everything" — never "nothing". */
  selected: string[];
  sort: SortOrder;
}

export function readFilters(url: URL, param: string): FilterState {
  return {
    selected: url.searchParams.getAll(param),
    sort: url.searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest',
  };
}

/**
 * Keep an item if it carries ANY of the selected facets (OR, not AND).
 *
 * OR is the honest default for a small site: with AND, picking a second tag
 * almost always empties the list, which reads as a broken filter rather than as
 * an empty intersection.
 */
export function matchesAny(facets: string[], selected: string[]): boolean {
  return selected.length === 0 || selected.some((s) => facets.includes(s));
}

/** Newest first by default. `date` is ISO, so a string compare is a date compare. */
export function byDate<T extends { date: string }>(
  items: T[],
  sort: SortOrder,
): T[] {
  return [...items].sort((a, b) =>
    sort === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date),
  );
}

/** Projects carry a `period`, not a date. Same idea. */
export function byPeriod<T extends { period: string }>(
  items: T[],
  sort: SortOrder,
): T[] {
  return [...items].sort((a, b) =>
    sort === 'newest'
      ? b.period.localeCompare(a.period)
      : a.period.localeCompare(b.period),
  );
}

/** Every distinct facet, sorted — the toolbar renders these. */
export function facetsOf<T>(items: T[], pick: (item: T) => string[]): string[] {
  return [...new Set(items.flatMap(pick))].sort();
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'newest first' },
  { value: 'oldest', label: 'oldest first' },
];

/**
 * Is there anything here worth a filter bar?
 *
 * Below two facets there is nothing to choose between, and below two items nothing to
 * sort. A control that cannot change anything is worse than no control: it advertises
 * a capacity the page does not have, and a reader who clicks it and sees nothing
 * happen concludes the site is broken.
 *
 * It lives here, and not only inside the component, so the caller can answer the
 * question WITHOUT loading it — the bar is code-split, and there is no sense fetching
 * a chunk to be told it renders nothing.
 */
export function hasAnythingToFilter(
  facets: string[],
  itemCount: number,
): boolean {
  return facets.length >= 2 && itemCount >= 2;
}
