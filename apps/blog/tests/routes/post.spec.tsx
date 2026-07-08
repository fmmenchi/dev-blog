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
    renderPost('blog-in-200-righe');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Ho riscritto il mio blog in 200 righe',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: /Il problema/ }),
    ).toBeTruthy();
  });

  it('exposes a table of contents linking to the sections', async () => {
    renderPost('blog-in-200-righe');
    const toc = await screen.findByRole('navigation', {
      name: 'In questa pagina',
    });
    expect(toc).toBeTruthy();
    const first = screen.getByRole('link', { name: /01 · Il problema/ });
    expect(first.getAttribute('href')).toBe('#il-problema');
    expect(
      screen
        .getByRole('heading', { level: 2, name: /Il problema/ })
        .getAttribute('id'),
    ).toBe('il-problema');
  });

  it('links the neighbouring articles', async () => {
    renderPost('blog-in-200-righe');
    await screen.findByRole('navigation', { name: 'Altri articoli' });
    expect(
      screen.getByRole('link', { name: /precedente/ }).getAttribute('href'),
    ).toBe('/blog/addio-microservizi');
  });
});
