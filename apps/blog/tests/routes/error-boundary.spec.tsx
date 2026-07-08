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
  it('renders the styled 404 page with a way home', async () => {
    renderWithStatus(404);
    expect(
      await screen.findByRole('heading', { name: /doesn't exist/ }),
    ).toBeTruthy();
    expect(screen.getByText(/404 — NOT FOUND/)).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: '← back to the blog' })
        .getAttribute('href'),
    ).toBe('/');
  });

  it('renders the generic page for other errors', async () => {
    renderWithStatus(500);
    expect(
      await screen.findByRole('heading', { name: /Something/ }),
    ).toBeTruthy();
    expect(screen.getByText(/UNEXPECTED ERROR/)).toBeTruthy();
  });
});
