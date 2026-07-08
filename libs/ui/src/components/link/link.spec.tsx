import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Link } from './link.component';

describe('Link', () => {
  it('renders internal hrefs as router links without target', () => {
    render(
      <MemoryRouter>
        <Link href="/about">Chi sono</Link>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Chi sono' });
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('opens external hrefs in a new tab with rel protection', () => {
    render(<Link href="https://example.com">Esempio</Link>);
    const link = screen.getByRole('link', { name: /Esempio/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('announces the new tab to screen readers', () => {
    render(<Link href="https://example.com">Esempio</Link>);
    expect(
      screen.getByRole('link', {
        name: /si apre in una nuova scheda/,
      }),
    ).toBeTruthy();
  });
});
