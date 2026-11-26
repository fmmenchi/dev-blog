import { createRoutesStub } from 'react-router';
import { render, screen, within } from '@testing-library/react';

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
   * The projects span several languages, so the page offers one filter per
   * language the data holds — no more, no fewer. The bar hiding itself when
   * there is nothing to choose between is covered in filter-bar.spec.tsx.
   */
  it('offers a filter for every language the projects use', async () => {
    const languages = [...new Set(projects.map(({ language }) => language))];
    renderPage();
    const bar = await screen.findByRole('toolbar', {
      name: 'Filter by language',
    });
    const buttons = within(bar).getAllByRole('button');
    expect(buttons.map((button) => button.textContent).sort()).toEqual(
      languages.sort(),
    );
  });

  it('filters from the URL alone, and says so when nothing matches', async () => {
    renderPage('/?language=Rust');
    /* The empty state must explain the filter, not pretend the site is empty. */
    expect(await screen.findByText(/Nothing in that language/)).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Projects' })).toBeNull();
  });
});
