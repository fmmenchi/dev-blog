import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ShareBar } from './share-bar.component';

const URL = 'https://fabiomenchicchi.com/blog/a-post';

function renderBar() {
  return render(<ShareBar url={URL} title="A post" />);
}

describe('ShareBar', () => {
  afterEach(() => {
    // @ts-expect-error — putting the environment back as we found it.
    delete navigator.share;
  });

  it('links to LinkedIn with the absolute url, encoded', () => {
    renderBar();
    const link = screen.getByRole('link', { name: /Share on LinkedIn/i });

    /* A relative url is meaningless the moment it leaves the page. */
    expect(link.getAttribute('href')).toContain(encodeURIComponent(URL));
    /* It is a plain link, so it works with the page's JavaScript switched off. */
    expect(link.tagName).toBe('A');
  });

  it('copies the link, and says so out loud', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderBar();
    fireEvent.click(screen.getByRole('button', { name: /Copy link/i }));

    expect(writeText).toHaveBeenCalledWith(URL);
    /* A tick nobody can see has told a screen-reader user nothing (WCAG 4.1.3). */
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe(
        'Link copied to the clipboard',
      ),
    );
  });

  it('says nothing when the copy did not happen', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });

    renderBar();
    fireEvent.click(screen.getByRole('button', { name: /Copy link/i }));

    /* Claiming a success that did not happen is worse than staying quiet. */
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('offers the native sheet only where there is one', async () => {
    /* It cannot be decided during render: the server has no navigator, and guessing
       would make the markup disagree with the browser's. */
    expect(screen.queryByRole('button', { name: /^Share$/i })).toBeNull();

    Object.assign(navigator, { share: vi.fn().mockResolvedValue(undefined) });
    renderBar();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^Share$/i })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole('button', { name: /^Share$/i }));
    expect(navigator.share).toHaveBeenCalledWith({ title: 'A post', url: URL });
  });
});
