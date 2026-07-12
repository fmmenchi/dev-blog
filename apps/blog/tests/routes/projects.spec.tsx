import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import { projects } from '../../app/lib/content';
import Projects from '../../app/routes/projects';

function renderPage() {
  const Stub = createRoutesStub([{ path: '/', Component: Projects }]);
  return render(<Stub />);
}

describe('Projects', () => {
  it('renders the page heading and intro', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeTruthy();
    expect(screen.getByText(/Almost all open source/)).toBeTruthy();
  });

  // Driven by the data, not by a hardcoded list: the projects change, the test shouldn't.
  it('lists every project with its name as a heading', () => {
    renderPage();
    expect(screen.getByRole('list', { name: 'Projects' })).toBeTruthy();
    for (const { name } of projects) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
  });
});
