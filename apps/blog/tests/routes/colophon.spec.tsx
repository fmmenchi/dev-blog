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

  /*
   * This test used to assert the string "No analytics, no cookies". It passed for as long
   * as the claim was on the page, including all the while the claim was false: the zone
   * had Cloudflare Web Analytics switched on and the edge was injecting a beacon into
   * every response. A test can check that a promise is made. It cannot check that it is
   * kept, and this one never pretended otherwise.
   *
   * So it asserts the two things the page can actually be held to: the promise is stated,
   * and the vendor is named. Whether the promise HOLDS is a question about production,
   * not about this component, and it is answered by looking at what a real browser is
   * left holding after a real visit.
   */
  it('names everything the site keeps, and who collects it', () => {
    renderPage();
    const promise = screen.getByText(/No cookies, and no consent banner/);

    /* The accent lives in localStorage. A privacy note that does not mention the one
       thing the site writes to your device is the note we already shipped twice. */
    expect(promise.textContent).toMatch(/the accent you picked/);
    expect(promise.textContent).toMatch(/Cloudflare Web Analytics/);
  });
});
