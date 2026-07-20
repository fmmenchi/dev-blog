import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub, useLocation } from 'react-router';

import { TableOfContents } from '../../app/components/table-of-contents';

const ENTRIES = [
  { id: 'the-problem', text: 'The problem' },
  { id: 'the-fix', text: 'The fix' },
];

/*
 * jsdom implements neither of the two browser APIs this component leans on: it has no
 * layout, so `scrollIntoView` does not exist, and no media engine, so `matchMedia` does
 * not either. Both are stubbed rather than guarded against in the component — in a
 * browser they are always there, and a `typeof` check in the source would exist purely
 * to describe the test environment.
 */
let scrollIntoView: ReturnType<typeof vi.fn>;

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: reduce, media: query })),
  );
}

beforeEach(() => {
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  setReducedMotion(false);
});

afterEach(() => vi.unstubAllGlobals());

/** The rail, plus the headings it points at and a probe for the URL's hash. */
function renderToc() {
  const Stub = createRoutesStub([
    {
      path: '/blog/:slug',
      Component: () => {
        const { hash } = useLocation();
        return (
          <>
            <TableOfContents entries={ENTRIES} />
            {ENTRIES.map((entry) => (
              <h2 key={entry.id} id={entry.id}>
                {entry.text}
              </h2>
            ))}
            <p data-testid="hash">{hash}</p>
          </>
        );
      },
    },
  ]);
  return render(<Stub initialEntries={['/blog/a-post']} />);
}

/** The numbering is part of the link's accessible name: `01 · The problem`. */
const linkTo = (entry: (typeof ENTRIES)[number], index: number) =>
  screen.getByRole('link', {
    name: `${String(index + 1).padStart(2, '0')} · ${entry.text}`,
  });

describe('TableOfContents', () => {
  it('lists the sections as anchors on their headings', () => {
    renderToc();

    expect(
      screen.getByRole('navigation', { name: 'On this page' }),
    ).toBeTruthy();

    ENTRIES.forEach((entry, i) =>
      expect(linkTo(entry, i).getAttribute('href')).toBe(`#${entry.id}`),
    );
  });

  it('scrolls smoothly to the section, puts it in the URL and focuses it', async () => {
    renderToc();

    const [, second] = ENTRIES;
    if (second === undefined) throw new Error('the fixture lost an entry');
    await userEvent.click(linkTo(second, 1));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    /* The section stays linkable — a smooth scroll that swallows the hash has taken
       something away from the reader. */
    expect(screen.getByTestId('hash').textContent).toBe(`#${second.id}`);

    /* And Tab carries on from the heading, not from the table of contents. */
    const heading = screen.getByRole('heading', { name: second.text });
    expect(document.activeElement).toBe(heading);
  });

  it('jumps without animating under prefers-reduced-motion', async () => {
    setReducedMotion(true);
    renderToc();

    const [first] = ENTRIES;
    if (first === undefined) throw new Error('the fixture lost an entry');
    await userEvent.click(linkTo(first, 0));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('leaves a modified click to the browser, which opens a new tab', () => {
    renderToc();

    const [first] = ENTRIES;
    if (first === undefined) throw new Error('the fixture lost an entry');
    /* Cmd-click: the reader asked for a tab, not for a scroll. `fireEvent`, because
       the modifier has to be ON the click and userEvent's held keys do not reach it. */
    fireEvent.click(linkTo(first, 0), { metaKey: true });

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByTestId('hash').textContent).toBe('');
  });
});
