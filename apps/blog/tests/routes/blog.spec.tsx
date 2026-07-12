import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';

import { getPosts } from '../../app/lib/posts.server';
import Blog, { loader } from '../../app/routes/blog';

function renderPage() {
  const Stub = createRoutesStub([{ path: '/', Component: Blog, loader }]);
  return render(<Stub />);
}

describe('Blog', () => {
  it('renders the archive heading', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeTruthy();
  });

  // Driven by the data: posts come and go, the test shouldn't.
  it('lists every post, linking to its article', async () => {
    renderPage();
    expect(await screen.findByRole('list', { name: 'Posts' })).toBeTruthy();
    for (const post of getPosts()) {
      const link = screen.getByRole('link', { name: new RegExp(post.title) });
      expect(link.getAttribute('href')).toBe(`/blog/${post.slug}`);
      expect(
        screen.getByRole('heading', { level: 2, name: post.title }),
      ).toBeTruthy();
    }
  });
});
