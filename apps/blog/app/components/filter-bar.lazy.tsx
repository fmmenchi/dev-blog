import { lazy, Suspense } from 'react';

import { hasAnythingToFilter } from '../lib/filters';

import type { FilterBarProps } from './filter-bar';

/**
 * The filter bar, code-split.
 *
 * WHY: `libs/ui` is imported by `root.tsx`, so its chunk is shared and loads on EVERY
 * page. Radix's Select — a portal, a focus scope and floating positioning — was
 * therefore downloaded by the home page, which has no dropdown. Route splitting (which
 * React Router does for free) cannot help: the cost is in a chunk shared BETWEEN
 * routes, not in a route.
 *
 * A dynamic import gives the bar a chunk of its own, so only the pages that actually
 * show it pay for it.
 *
 * The threshold is checked HERE, before the import: if there is nothing to filter, the
 * chunk is never even requested. Asking the component would mean fetching it to be told
 * it renders nothing — and reserving fallback space for a bar that never appears, which
 * is a layout shift for no reason.
 */
const FilterBarImpl = lazy(() =>
  import('./filter-bar').then((module) => ({ default: module.FilterBar })),
);

export function FilterBar(props: FilterBarProps) {
  if (!hasAnythingToFilter(props.facets, props.itemCount)) return null;

  return (
    /*
     * The fallback is only ever seen if the chunk is slow: the server streams the real
     * bar into the HTML, and hydration swaps it in place. It reserves the bar's height
     * so a slow chunk cannot push the list down.
     */
    <Suspense fallback={<div className="h-9" aria-hidden="true" />}>
      <FilterBarImpl {...props} />
    </Suspense>
  );
}
