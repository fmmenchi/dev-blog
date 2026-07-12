import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import About from '../../app/routes/about';

function renderPage() {
  const Stub = createRoutesStub([{ path: '/', Component: About }]);
  return render(<Stub />);
}

describe('About', () => {
  it('renders the greeting heading and the main landmark', () => {
    renderPage();
    expect(screen.getByRole('main')).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 1, name: /Hi, I'm Fabio/ }),
    ).toBeTruthy();
  });

  it('announces external social links to screen readers', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: 'Social' });
    expect(nav).toBeTruthy();
    expect(
      screen.getByRole('link', {
        name: /github.*opens in a new tab/,
      }),
    ).toBeTruthy();
  });

  it('tells the reader where Fabio is and what he works on', () => {
    renderPage();
    expect(screen.getByText(/Peruvian Andes/)).toBeTruthy();
    expect(screen.getByText(/product on mobile and web/)).toBeTruthy();
  });
});
