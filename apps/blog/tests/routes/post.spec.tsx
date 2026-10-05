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

/*
 * How long the route may take to show up, and how long a test here may run. The stub
 * resolves the loader and then renders a whole article in jsdom — a 14-minute post with
 * its diagrams. On a machine busy with other builds that took 1.4s, past the one second
 * `findBy*` waits by default, and the test failed on a heading that was about to appear;
 * with every core oversubscribed it took 6s, past the 5s a test gets. Neither number is
 * about the route. These are patience, not a target: an idle run never gets near them.
 */
const ROUTE_RENDERED = { timeout: 10_000 };
const TEST_BUDGET = { timeout: 15_000 };

describe('Post', TEST_BUDGET, () => {
  it('renders the article with its title and its sections', async () => {
    renderPost(post.slug);

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: post.title },
        ROUTE_RENDERED,
      ),
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
      await screen.findByRole(
        'navigation',
        { name: 'On this page' },
        ROUTE_RENDERED,
      ),
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
    await screen.findByRole('heading', { level: 1 }, ROUTE_RENDERED);

    const nav = screen.queryByRole('navigation', { name: 'More posts' });
    if (posts.length > 1) expect(nav).toBeTruthy();
    else expect(nav).toBeNull();
  });
});
