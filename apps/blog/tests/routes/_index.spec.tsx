import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import Home, { loader } from '../../app/routes/home';

function renderHome() {
  const Stub = createRoutesStub([{ path: '/', Component: Home, loader }]);
  return render(<Stub />);
}

describe('Home', () => {
  it('renders the hero and the main landmark', async () => {
    renderHome();
    expect(await screen.findByRole('main')).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /decisions behind the code/,
      }),
    ).toBeTruthy();
  });

  it('features the latest post with its tags', async () => {
    renderHome();
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'I rewrote my blog in 200 lines',
      }),
    ).toBeTruthy();
    expect(screen.getByText('#web')).toBeTruthy();
    expect(screen.getByText('★ latest')).toBeTruthy();
  });

  it('lists every post as a link to its article', async () => {
    renderHome();
    const links = await screen.findAllByRole('link', { name: /./ });
    const postLinks = links.filter((l) =>
      l.getAttribute('href')?.startsWith('/blog/'),
    );
    expect(postLinks.length).toBe(5);
  });

  it('exposes profile skills accessibly', async () => {
    renderHome();
    expect(await screen.findByRole('list', { name: 'Skills' })).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
  });
});
