import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import { SiteFooter } from '../../app/components/site-footer';
import { getBuildInfo } from '../../app/lib/build-info';

function renderFooter() {
  const Stub = createRoutesStub([{ path: '*', Component: SiteFooter }]);
  return render(<Stub initialEntries={['/']} />);
}

/* `Footer` itself is covered in libs/ui. What is asserted here is the wiring: the
   routes THIS site has, and the build IT was compiled from. */
describe('SiteFooter', () => {
  it('shows the build it was compiled from', () => {
    renderFooter();

    /* Not a hard-coded string: the version is whatever `define` inlined for this
       build, and asserting a literal would just re-state the fixture. */
    const { version } = getBuildInfo();
    expect(version).toBeTruthy();

    const build = screen.getByText(/^v\d/);
    expect(build.textContent).toContain(`v${version}`);
  });

  it('links the secondary pages, and asks for the feed as a document', () => {
    renderFooter();

    const nav = screen.getByRole('navigation', { name: 'Secondary' });
    for (const label of ['rss', 'colophon', 'uses']) {
      expect(screen.getByRole('link', { name: label })).toBeTruthy();
    }
    expect(nav.querySelectorAll('a')).toHaveLength(3);

    /* A resource route: a document request, not a client navigation. */
    expect(screen.getByRole('link', { name: 'rss' }).getAttribute('href')).toBe(
      '/rss.xml',
    );
  });
});
