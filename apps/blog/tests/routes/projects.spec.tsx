import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

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

  it('lists all four projects with their names as headings', () => {
    renderPage();
    const list = screen.getByRole('list', { name: 'Projects' });
    expect(list).toBeTruthy();
    for (const name of ['rss-gen', 'tempo', 'quaderno', 'dotfiles']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
  });
});
