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
    renderPost('starting-a-notebook');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Starting a notebook',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: /What goes here/ }),
    ).toBeTruthy();
  });

  it('exposes a table of contents linking to the sections', async () => {
    renderPost('starting-a-notebook');
    const toc = await screen.findByRole('navigation', {
      name: 'On this page',
    });
    expect(toc).toBeTruthy();
    const first = screen.getByRole('link', { name: /01 · What goes here/ });
    expect(first.getAttribute('href')).toBe('#what-goes-here');
    expect(
      screen
        .getByRole('heading', { level: 2, name: /What goes here/ })
        .getAttribute('id'),
    ).toBe('what-goes-here');
  });

  it('hides the siblings nav when a post has no neighbours', async () => {
    renderPost('starting-a-notebook');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('navigation', { name: 'More posts' })).toBeNull();
  });
});
