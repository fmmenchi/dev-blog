import { Link } from '@dev-blog/ui';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { SectionHeading } from './section-heading';
import type { TocEntry } from '../lib/posts.server';

export interface TableOfContentsProps {
  /** The post's `##` headings, collected at build time by tools/remark-toc.mjs. */
  entries: TocEntry[];
}

const ITEM =
  'ps-4 py-1.75 text-[13.5px] text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary';

/**
 * The post's sections, as a list of anchors.
 *
 * The markup is a plain `#hash` anchor and stays one: with scripting off, or before
 * hydration, a click still lands on the heading — the browser's own jump. The handler
 * below only upgrades that jump to a smooth one.
 *
 * It is done here, per click, rather than with `scroll-behavior: smooth` on `html`,
 * because that property is global and `<ScrollRestoration />` scrolls through the same
 * `window.scrollTo`: every navigation would ANIMATE its way to the top of the next page
 * instead of arriving there. One handler on the nav costs nothing and touches nothing
 * else.
 */
export function TableOfContents({ entries }: TableOfContentsProps) {
  const navigate = useNavigate();

  const onClick = (event: MouseEvent<HTMLElement>) => {
    /* A modified click is a request for a new tab, not for a scroll. */
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;

    const anchor = (event.target as HTMLElement).closest('a[href^="#"]');
    const id = anchor?.getAttribute('href')?.slice(1);
    const heading = id ? document.getElementById(id) : null;
    /* No heading, no upgrade: leave the browser to fail the way it normally would. */
    if (!heading) return;

    event.preventDefault();

    /* The hash belongs in the URL — the section has to stay linkable. Through the
       router, not `history.pushState`, which would write over the location key that
       ScrollRestoration reads. `preventScrollReset` because the scroll is ours. */
    navigate({ hash: `#${id}` }, { preventScrollReset: true });

    heading.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });

    /* A native anchor jump also moves the keyboard's place in the document; a scroll
       done by hand does not, so Tab would carry on from the table of contents while the
       reader is looking at the section. `preventScroll` so focus does not undo the
       smooth scroll with an instant one. */
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  };

  return (
    <>
      <SectionHeading>on this page</SectionHeading>
      <nav
        aria-label="On this page"
        onClick={onClick}
        className="flex flex-col gap-0.5 border-s border-border"
      >
        {entries.map((entry, i) => (
          <Link
            key={entry.id}
            href={`#${entry.id}`}
            variant="plain"
            className={ITEM}
          >
            {String(i + 1).padStart(2, '0')} · {entry.text}
          </Link>
        ))}
      </nav>
    </>
  );
}
