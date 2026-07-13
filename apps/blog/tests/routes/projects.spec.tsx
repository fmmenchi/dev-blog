import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import { projects } from '../../app/lib/content';
import Projects, { loader } from '../../app/routes/projects';

function renderPage(url = '/') {
  const Stub = createRoutesStub([
    { path: '/', Component: Projects, loader, HydrateFallback: () => null },
  ]);
  return render(<Stub initialEntries={[url]} />);
}

describe('Projects', () => {
  it('renders the page heading and intro', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeTruthy();
    expect(screen.getByText(/Almost all open source/)).toBeTruthy();
  });

  // Driven by the data, not by a hardcoded list: the projects change, the test shouldn't.
  it('lists every project with its name as a heading', async () => {
    renderPage();
    expect(await screen.findByRole('list', { name: 'Projects' })).toBeTruthy();
    for (const { name } of projects) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
  });

  /*
   * With a single project there is nothing to filter and nothing to sort, so the
   * bar stays away rather than offering controls that cannot change the page.
   * Its behaviour, on a list worth filtering, is covered in filter-bar.spec.tsx.
   */
  it('does not offer a filter it cannot honour', async () => {
    renderPage();
    await screen.findByRole('heading', { level: 1, name: 'Projects' });
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('filters from the URL alone, and says so when nothing matches', async () => {
    renderPage('/?language=Rust');
    /* The empty state must explain the filter, not pretend the site is empty. */
    expect(await screen.findByText(/Nothing in that language/)).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Projects' })).toBeNull();
  });
});
