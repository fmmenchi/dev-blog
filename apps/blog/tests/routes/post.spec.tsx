import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import Post, { loader } from '../../app/routes/post';

function renderPost(slug: string) {
  const Stub = createRoutesStub([
    { path: '/blog/:slug', Component: Post, loader },
  ]);
  return render(<Stub initialEntries={[`/blog/${slug}`]} />);
}

describe('Post', () => {
  it('renders the article with title and numbered sections', async () => {
    renderPost('rewrote-my-blog-in-200-lines');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'I rewrote my blog in 200 lines',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: /The problem/ }),
    ).toBeTruthy();
  });

  it('exposes a table of contents linking to the sections', async () => {
    renderPost('rewrote-my-blog-in-200-lines');
    const toc = await screen.findByRole('navigation', {
      name: 'On this page',
    });
    expect(toc).toBeTruthy();
    const first = screen.getByRole('link', { name: /01 · The problem/ });
    expect(first.getAttribute('href')).toBe('#the-problem');
    expect(
      screen
        .getByRole('heading', { level: 2, name: /The problem/ })
        .getAttribute('id'),
    ).toBe('the-problem');
  });

  it('links the neighbouring articles', async () => {
    renderPost('rewrote-my-blog-in-200-lines');
    await screen.findByRole('navigation', { name: 'More articles' });
    expect(
      screen.getByRole('link', { name: /previous/ }).getAttribute('href'),
    ).toBe('/blog/why-i-left-microservices');
  });
});
