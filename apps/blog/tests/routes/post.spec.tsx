import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';

import Post, { loader } from '../../app/routes/post';
import { firstPost, posts, sectionsOf, slugify } from '../support/content';

function renderPost(slug: string) {
  const Stub = createRoutesStub([
    { path: '/blog/:slug', Component: Post, loader },
  ]);
  return render(<Stub initialEntries={[`/blog/${slug}`]} />);
}

/* Whatever is published. Rewrite every post tomorrow and these still hold. */
const post = firstPost();
const sections = sectionsOf(post);

describe('Post', () => {
  it('renders the article with its title and its sections', async () => {
    renderPost(post.slug);
    expect(
      await screen.findByRole('heading', { level: 1, name: post.title }),
    ).toBeTruthy();

    for (const section of sections) {
      expect(
        screen.getByRole('heading', { level: 2, name: section }),
      ).toBeTruthy();
    }
  });

  it('builds a table of contents from those sections, and anchors them', async () => {
    renderPost(post.slug);
    expect(
      await screen.findByRole('navigation', { name: 'On this page' }),
    ).toBeTruthy();

    const [first] = sections;
    if (first === undefined) throw new Error('the post has no ## sections');

    /* The link must point at an id the page actually renders. */
    const link = screen.getByRole('link', {
      name: new RegExp(`01 · ${first}`),
    });
    expect(link.getAttribute('href')).toBe(`#${slugify(first)}`);
    expect(
      screen.getByRole('heading', { level: 2, name: first }).getAttribute('id'),
    ).toBe(slugify(first));
  });

  it('shows the siblings nav only when there are siblings', async () => {
    renderPost(post.slug);
    await screen.findByRole('heading', { level: 1 });

    const nav = screen.queryByRole('navigation', { name: 'More posts' });
    if (posts.length > 1) expect(nav).toBeTruthy();
    else expect(nav).toBeNull();
  });
});
