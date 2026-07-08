import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import Colophon from '../../app/routes/colophon';

function renderPage() {
  const Stub = createRoutesStub([{ path: '/', Component: Colophon }]);
  return render(<Stub />);
}

describe('Colophon', () => {
  it('renders the heading and the stack terms', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Colophon' }),
    ).toBeTruthy();
    expect(screen.getByText('framework')).toBeTruthy();
    expect(screen.getByText(/React Router v8/)).toBeTruthy();
  });

  it('links the source repository announcing the new tab', () => {
    renderPage();
    expect(
      screen.getByRole('link', {
        name: /github.com\/fmmenchi\/dev-blog.*opens in a new tab/,
      }),
    ).toBeTruthy();
  });

  it('states the no-tracking principle', () => {
    renderPage();
    expect(screen.getByText(/No analytics, no cookies/)).toBeTruthy();
  });
});
