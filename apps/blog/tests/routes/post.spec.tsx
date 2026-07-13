import { render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';

import Post, { loader } from '../../app/routes/post';
import { firstPost, posts } from '../support/content';

function renderPost(slug: string) {
  const Stub = createRoutesStub([
    { path: '/blog/:slug', Component: Post, loader },
  ]);
  return render(<Stub initialEntries={[`/blog/${slug}`]} />);
}

/* Whatever is published. Rewrite every post tomorrow and these still hold. */
const post = firstPost();

describe('Post', () => {
  it('renders the article with its title and its sections', async () => {
    renderPost(post.slug);

    expect(
      await screen.findByRole('heading', { level: 1, name: post.title }),
    ).toBeTruthy();

    /* The content is an MDX component, loaded lazily — it arrives after the shell. */
    for (const { text } of post.toc) {
      await waitFor(() =>
        expect(
          screen.getByRole('heading', { level: 2, name: text }),
        ).toBeTruthy(),
      );
    }
  });

  it('builds a table of contents whose links land on real headings', async () => {
    renderPost(post.slug);

    expect(
      await screen.findByRole('navigation', { name: 'On this page' }),
    ).toBeTruthy();

    const [first] = post.toc;
    if (first === undefined) throw new Error('the post has no ## sections');

    /*
     * The id in the TOC comes from our remark plugin; the id on the heading comes from
     * rehype-slug. If the two ever disagree the link points at nothing — silently, which
     * is the only way it could go wrong.
     */
    const link = screen.getByRole('link', {
      name: new RegExp(`01 · ${first.text}`),
    });
    expect(link.getAttribute('href')).toBe(`#${first.id}`);

    await waitFor(() =>
      expect(
        screen
          .getByRole('heading', { level: 2, name: first.text })
          .getAttribute('id'),
      ).toBe(first.id),
    );
  });

  it('shows the siblings nav only when there are siblings', async () => {
    renderPost(post.slug);
    await screen.findByRole('heading', { level: 1 });

    const nav = screen.queryByRole('navigation', { name: 'More posts' });
    if (posts.length > 1) expect(nav).toBeTruthy();
    else expect(nav).toBeNull();
  });
});
