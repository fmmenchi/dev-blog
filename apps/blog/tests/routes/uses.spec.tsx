import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import Uses from '../../app/routes/uses';

function renderPage() {
  const Stub = createRoutesStub([{ path: '/', Component: Uses }]);
  return render(<Stub />);
}

describe('Uses', () => {
  it('renders the heading and all sections', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Uses' }),
    ).toBeTruthy();
    for (const label of [
      'Editor and terminal',
      'Hardware',
      'Apps and services',
    ]) {
      expect(screen.getByRole('region', { name: label })).toBeTruthy();
    }
  });

  it('lists the editor', () => {
    renderPage();
    expect(screen.getByText(/Neovim/)).toBeTruthy();
  });
});
