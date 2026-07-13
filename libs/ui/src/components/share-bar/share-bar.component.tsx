import { CheckIcon, LinkedinIcon, LinkIcon, ShareIcon } from '@dev-blog/icons';
import { useEffect, useState } from 'react';

import { cn } from '../../internal/cn';
import { Link } from '../link/link.component';

export interface ShareBarProps {
  /** ABSOLUTE url. A relative one is meaningless the moment it leaves the page. */
  url: string;
  /** Used by the native share sheet, which shows it above the link. */
  title: string;
  /** Names the group for assistive tech. */
  label?: string;
  className?: string;
}

/* Same shape as IconLinks' items — and border-border-strong, because the separator
   grey measures 1.18:1 and would leave these with no visible edge. */
const ACTION =
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-transparent text-muted-foreground [transition:var(--transition-color)] hover:border-primary hover:text-primary';

/**
 * Share THIS page. Not "follow me" — that is `IconLinks`, and they are different
 * questions: one is about the reader's network, the other about mine.
 *
 * On a phone the native share sheet does the whole job (WhatsApp, Telegram, Notes,
 * anything installed), so when the browser has one it is offered FIRST. It cannot be
 * rendered on the server, though: `navigator.share` exists only on the client, and
 * deciding during render would mean the server and the browser disagreeing about the
 * markup. So it appears after mount — the rest of the bar works without it, and works
 * without JavaScript at all in LinkedIn's case, which is a plain link.
 *
 * Copying announces itself (WCAG 4.1.3): a button whose only feedback is a tick nobody
 * can see has told a screen-reader user nothing.
 *
 * No X. It was removed from this site's socials on purpose, and adding it back through
 * a side door would be a decision made by a component rather than by a person.
 */
export function ShareBar({
  url,
  title,
  label = 'Share this post',
  className,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canShareNatively, setCanShareNatively] = useState(false);

  /* After mount, never during render: the server has no navigator. */
  useEffect(() => {
    setCanShareNatively(typeof navigator.share === 'function');
  }, []);

  /* The tick is a confirmation, not a state: it goes away on its own. */
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* Denied clipboard permission, or an insecure origin. Say nothing rather than
         claim a success that did not happen. */
    }
  };

  const share = () => {
    void navigator.share({ title, url }).catch(() => {
      /* The sheet was dismissed. That is not an error. */
    });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-mono text-2xs text-muted-foreground">share</span>

      <div className="flex items-center gap-2" role="group" aria-label={label}>
        {canShareNatively ? (
          <button type="button" onClick={share} className={ACTION}>
            <ShareIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">Share</span>
          </button>
        ) : null}

        {/* A plain link: it works with the page's JavaScript switched off. */}
        <Link
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          variant="plain"
          className={ACTION}
        >
          <LinkedinIcon aria-hidden="true" className="size-4" />
          <span className="sr-only">Share on LinkedIn</span>
        </Link>

        <button type="button" onClick={copy} className={ACTION}>
          {copied ? (
            <CheckIcon aria-hidden="true" className="size-4 text-primary" />
          ) : (
            <LinkIcon aria-hidden="true" className="size-4" />
          )}
          <span className="sr-only">Copy link</span>
        </button>
      </div>

      {/* Otherwise the copy is silent to anyone not watching the icon. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Link copied to the clipboard' : ''}
      </span>
    </div>
  );
}
