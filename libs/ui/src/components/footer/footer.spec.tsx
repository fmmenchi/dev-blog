import { GithubIcon } from '@dev-blog/icons';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';

import { Footer, type FooterProps } from './footer.component';

/* Invented data. The real site is not a fixture. */
const NAV = [
  { label: 'rss', to: '/rss.xml', reloadDocument: true },
  { label: 'colophon', to: '/colophon' },
];

const SOCIAL = [
  { label: 'github', href: 'https://github.com/someone', icon: GithubIcon },
];

function renderFooter(props: Partial<FooterProps> = {}) {
  const Component = () => (
    <Footer
      copyright="© 2026 example.com"
      nav={NAV}
      social={SOCIAL}
      {...props}
    />
  );
  const Stub = createRoutesStub([{ path: '*', Component }]);
  return render(<Stub initialEntries={['/']} />);
}

describe('Footer', () => {
  it('keeps the two link groups apart', () => {
    renderFooter();

    /* Pages of this site, and places its author is elsewhere: two questions, two
       navs. A single row of links made "github" read like a page. */
    expect(screen.getByRole('navigation', { name: 'Secondary' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Social' })).toBeTruthy();
  });

  it('shows the build on its own row, prefixed and with the commit', () => {
    renderFooter({ buildInfo: { version: '1.2.3', commit: 'a1b2c3d' } });

    expect(screen.getByText('v1.2.3 (a1b2c3d)')).toBeTruthy();
  });

  it('drops the parentheses when there is no commit to name', () => {
    renderFooter({ buildInfo: { version: '1.2.3' } });

    /* An EXACT match: had a commit been appended, the row would read "v1.2.3 (…)"
       and this would find nothing. (A loose /\(/ would just match the social link's
       "(opens in a new tab)" hint.) */
    expect(screen.getByText('v1.2.3')).toBeTruthy();
    expect(screen.queryByText(/^v1\.2\.3 \(/)).toBeNull();
  });

  it('renders no build row at all when the app does not pass one', () => {
    renderFooter();

    expect(screen.queryByText(/^v\d/)).toBeNull();
  });

  it('asks the browser for a real document on a resource route', () => {
    renderFooter();

    /* /rss.xml is a document, not a screen. Client-routing to it would hand the
       browser a page that does not exist. */
    const rss = screen.getByRole('link', { name: 'rss' });
    expect(rss.getAttribute('href')).toBe('/rss.xml');
  });
});
