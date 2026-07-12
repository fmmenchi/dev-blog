import { createRoutesStub } from 'react-router';
import { fireEvent, render, screen } from '@testing-library/react';

import { SiteHeader } from '../../app/components/site-header';

function renderHeader(at = '/blog') {
  const Stub = createRoutesStub([{ path: '*', Component: SiteHeader }]);
  return render(<Stub initialEntries={[at]} />);
}

describe('SiteHeader', () => {
  it('exposes the main navigation with all sections', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toBeTruthy();
    for (const label of ['/blog', '/projects', '/about', '/rss']) {
      expect(screen.getByRole('link', { name: label })).toBeTruthy();
    }
  });

  it('marks the active section for assistive tech', () => {
    renderHeader('/blog');
    expect(
      screen.getByRole('link', { name: '/blog' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen
        .getByRole('link', { name: '/projects' })
        .getAttribute('aria-current'),
    ).toBeNull();
  });

  it('offers a skip link to the content', () => {
    renderHeader();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip.getAttribute('href')).toBe('#content');
  });

  it('cycles the accent and persists the choice', () => {
    renderHeader();
    const button = screen.getByRole('button', {
      name: /Change accent color/,
    });
    fireEvent.click(button);
    expect(document.documentElement.dataset['accent']).toBe('lime');
    expect(window.localStorage.getItem('fabio-accent')).toBe('lime');
  });
});
