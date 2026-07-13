import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub, useSearchParams } from 'react-router';

import { FilterBar } from '../../app/components/filter-bar';
import { readFilters } from '../../app/lib/filters';

/*
 * The bar is tested here, on invented data, and NOT through /blog or /projects.
 *
 * The real site holds one post and one project, so the bar correctly refuses to
 * render there — a route test could only ever assert its absence. Its behaviour
 * needs a list worth filtering, so this supplies one.
 *
 * The host reads `selected` and `sort` back OUT of the URL, exactly as the real
 * loaders do. That is the whole contract: the bar does not keep state, it writes
 * the URL and is re-rendered from it. A stub holding those as fixed props would
 * pass while the round-trip was broken.
 */
function renderBar(url = '/', props: Partial<FilterBarStubProps> = {}) {
  const Stub = createRoutesStub([
    {
      path: '/',
      Component: () => {
        const [searchParams] = useSearchParams();
        const { selected, sort } = readFilters(
          new URL(`https://x.dev/?${searchParams}`),
          'tag',
        );
        return (
          <FilterBar
            param="tag"
            label="Filter by tag"
            sortLabel="Sort posts"
            facets={['ai', 'meta', 'testing']}
            prefix="#"
            itemCount={5}
            selected={selected}
            sort={sort}
            {...props}
          />
        );
      },
    },
  ]);
  return render(<Stub initialEntries={[url]} />);
}

type FilterBarStubProps = Pick<
  Parameters<typeof FilterBar>[0],
  'facets' | 'itemCount'
>;

describe('FilterBar', () => {
  it('offers the facets and the sort order', async () => {
    renderBar();
    expect(
      await screen.findByRole('toolbar', { name: 'Filter by tag' }),
    ).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Sort posts' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '#meta' })).toBeTruthy();
  });

  it('reads the selection out of the URL', async () => {
    renderBar('/?tag=meta');
    /* Coloured is not enough — a screen reader has to be told too (WCAG 4.1.2). */
    expect(
      (await screen.findByRole('button', { name: '#meta' })).getAttribute(
        'aria-pressed',
      ),
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: '#ai' }).getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('writes a toggled facet back into the URL', async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(await screen.findByRole('button', { name: '#meta' }));
    /* Pressed again only because the URL changed and the host re-read it. */
    expect(
      await screen.findByRole('button', { name: '#meta', pressed: true }),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '#meta' }));
    expect(
      await screen.findByRole('button', { name: '#meta', pressed: false }),
    ).toBeTruthy();
  });

  /*
   * A control that cannot change anything advertises a capacity the page does not
   * have: click it, see nothing happen, conclude the site is broken.
   */
  it('hides itself when there is nothing to choose between', () => {
    const { container } = renderBar('/', { facets: ['meta'] });
    expect(container.textContent).toBe('');
  });

  it('hides itself when there is nothing to sort', () => {
    const { container } = renderBar('/', { itemCount: 1 });
    expect(container.textContent).toBe('');
  });
});
