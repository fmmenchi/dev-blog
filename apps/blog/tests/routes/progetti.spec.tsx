import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import Progetti from '../../app/routes/progetti';

function renderPage() {
  const Stub = createRoutesStub([{ path: '/', Component: Progetti }]);
  return render(<Stub />);
}

describe('Progetti', () => {
  it('renders the page heading and intro', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Progetti' }),
    ).toBeTruthy();
    expect(screen.getByText(/Quasi tutto open source/)).toBeTruthy();
  });

  it('lists all four projects with their names as headings', () => {
    renderPage();
    const list = screen.getByRole('list', { name: 'Progetti' });
    expect(list).toBeTruthy();
    for (const name of ['rss-gen', 'tempo', 'quaderno', 'dotfiles']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
  });
});
