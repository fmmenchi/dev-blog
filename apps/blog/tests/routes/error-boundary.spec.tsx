import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from '../../app/root';

function renderWithStatus(status: number) {
  const Stub = createRoutesStub([
    {
      path: '/',
      loader() {
        throw new Response(null, { status });
      },
      ErrorBoundary,
      Component: () => null,
    },
  ]);
  return render(<Stub />);
}

describe('ErrorBoundary', () => {
  it('renders the 404 page from the mock with a way home', async () => {
    renderWithStatus(404);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeTruthy();
    expect(screen.getByText(/HTTP 404/)).toBeTruthy();
    expect(screen.getByText(/Deleting code is an art form/)).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Back to the blog' })
        .getAttribute('href'),
    ).toBe('/');
  });

  it('renders the 500 page with reload action and home fallback', async () => {
    renderWithStatus(500);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Something broke' }),
    ).toBeTruthy();
    expect(screen.getByText(/HTTP 500/)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Reload the page' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '← or back to the blog' }),
    ).toBeTruthy();
  });
});
