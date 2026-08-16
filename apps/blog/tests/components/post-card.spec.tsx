import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';

import { PostCard, type PostCardProps } from '../../app/components/post-card';
import { firstPost } from '../support/content';

/* The card is a router link, so it needs a router around it to render at all. */
function renderCard(props: Omit<PostCardProps, 'post'> = {}) {
  const post = firstPost();
  const Stub = createRoutesStub([
    { path: '/', Component: () => <PostCard post={post} {...props} /> },
  ]);

  render(<Stub />);
  return post;
}

describe('PostCard', () => {
  /* The two sizes drifted while they were two copies of the markup: only the
     featured one carried the tags. Both variants are asserted for that reason. */
  it.each(['featured', 'compact'] as const)(
    'links the %s card to its post, with the title and every tag',
    async (variant) => {
      const post = renderCard({ variant });

      const link = await screen.findByRole('link', { name: /./ });
      expect(link.getAttribute('href')).toBe(`/blog/${post.slug}`);
      expect(
        screen.getByRole('heading', { level: 2, name: post.title }),
      ).toBeTruthy();
      for (const tag of post.tags) {
        expect(screen.getByText(`#${tag}`)).toBeTruthy();
      }
    },
  );

  it('marks the date up as a machine-readable time', async () => {
    const post = renderCard({ variant: 'featured' });

    await screen.findByRole('link', { name: /./ });
    const time = document.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe(post.date);
  });

  it('only shows the latest marker when it is asked to', async () => {
    renderCard({ latest: true });
    expect(await screen.findByText('★ latest')).toBeTruthy();
  });

  it('has no latest marker by default', async () => {
    renderCard();
    await screen.findByRole('link', { name: /./ });
    expect(screen.queryByText('★ latest')).toBeNull();
  });
});
