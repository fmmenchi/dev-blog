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
      screen.getByRole('heading', { level: 1, name: /Ciao, sono Fabio/ }),
    ).toBeTruthy();
  });

  it('announces external social links to screen readers', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: 'Social' });
    expect(nav).toBeTruthy();
    expect(
      screen.getByRole('link', {
        name: /github.*si apre in una nuova scheda/,
      }),
    ).toBeTruthy();
  });

  it('shows the now section', () => {
    renderPage();
    expect(screen.getByText('$ IN BUILD')).toBeTruthy();
    expect(screen.getByText('$ IN LETTURA')).toBeTruthy();
  });
});
