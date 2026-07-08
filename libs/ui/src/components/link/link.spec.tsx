import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Link } from './link.component';

describe('Link', () => {
  it('navigates client-side with the to prop', () => {
    render(
      <MemoryRouter>
        <Link to="/about">Chi sono</Link>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Chi sono' });
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('promotes internal hrefs to router links (no accidental reloads)', () => {
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
        name: /opens in a new tab/,
      }),
    ).toBeTruthy();
  });

  it('renders hash anchors as plain same-page links', () => {
    render(<Link href="#section">Sezione</Link>);
    const link = screen.getByRole('link', { name: 'Sezione' });
    expect(link.getAttribute('href')).toBe('#section');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('renders mailto without the new-tab treatment', () => {
    render(<Link href="mailto:me@example.com">Scrivimi</Link>);
    const link = screen.getByRole('link', { name: 'Scrivimi' });
    expect(link.getAttribute('target')).toBeNull();
    expect(link.textContent).toBe('Scrivimi');
  });

  it('carries no visual classes with the plain variant', () => {
    render(
      <MemoryRouter>
        <Link href="/x" variant="plain" className="mine">
          X
        </Link>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'X' }).getAttribute('class')).toBe(
      'mine',
    );
  });
});
