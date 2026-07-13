import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import { SiteFooter } from '../../app/components/site-footer';
import { getBuildInfo } from '../../app/lib/build-info';

function renderFooter() {
  const Stub = createRoutesStub([{ path: '*', Component: SiteFooter }]);
  return render(<Stub initialEntries={['/']} />);
}

describe('SiteFooter', () => {
  it('shows the build it was compiled from', () => {
    renderFooter();

    /* Not a hard-coded string: the version is whatever `define` inlined for THIS
       build, and asserting a literal would just re-state the fixture. What has to
       hold is that the footer prints it, and prints it as a version. */
    const { version } = getBuildInfo();
    expect(version).toBeTruthy();

    const line = screen.getByText(/^© 2026 fabiomenchicchi\.com ·/);
    expect(line.textContent).toContain(`v${version}`);
  });

  it('keeps the two link groups apart', () => {
    renderFooter();
    expect(screen.getByRole('navigation', { name: 'Secondary' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Social' })).toBeTruthy();
  });
});
