import {
  BlueskyIcon,
  CheckIcon,
  HackerNewsIcon,
  LinkedinIcon,
  LinkIcon,
  ShareIcon,
  XIcon,
} from '@dev-blog/icons';
import {
  SHARE_CHANNEL_NAMES,
  canShareNatively,
  copyText,
  shareHref,
  shareNatively,
} from '@fmmenchi/share';
import type { ComponentType, SVGProps } from 'react';
import { useEffect, useState } from 'react';

import { cn } from '../../internal/cn';
import { Link } from '../link/link.component';

/**
 * Where a technical post actually travels.
 *
 * Instagram, TikTok and Facebook are absent, and for Instagram and TikTok that is not a
 * judgement: they have **no mechanism** to share a URL at all. Facebook has one, and it
 * is the wrong room for a post about SVGR configs.
 *
 * Mastodon is absent for a real technical reason: there is no universal share URL,
 * because there is no single server. It would mean asking the reader which instance
 * they are on, or routing them through somebody else's redirector. On a phone the
 * native sheet already opens their Mastodon app, which is the better answer anyway.
 */
export type ShareChannel = 'x' | 'bluesky' | 'linkedin' | 'hackernews';

/* The links, the names, the clipboard and the native sheet come from @fmmenchi/share —
   one place that keeps each channel's address current. What stays here is what that
   package leaves to the app: which channels, in which order, and how they look. */
const ICONS: Record<ShareChannel, ComponentType<SVGProps<SVGSVGElement>>> = {
  x: XIcon,
  bluesky: BlueskyIcon,
  linkedin: LinkedinIcon,
  /* A SUBMISSION to a public aggregator, not a share with friends. Different thing,
     and the right one for a post like these. */
  hackernews: HackerNewsIcon,
};

export interface ShareBarProps {
  /** ABSOLUTE url. A relative one is meaningless the moment it leaves the page. */
  url: string;
  /** The share sheets and intents put it above the link. */
  title: string;
  /** Ordered. Copy is not among them: it is always there, and always last. */
  channels?: ShareChannel[];
  label?: string;
  className?: string;
}

/* border-border-strong, because the separator grey measures 1.18:1 and would leave
   these with no visible edge at all — the bug the badges had. */
const ACTION =
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-transparent text-muted-foreground [transition:var(--transition-color)] hover:border-primary hover:text-primary';

/**
 * Share THIS page. Not "follow me" — that is `IconLinks`, and they are different
 * questions: this one is about the READER's network, that one about mine. X sits here
 * and not there for exactly that reason.
 *
 * On a phone the native sheet does the whole job — WhatsApp, Telegram, Mastodon, Notes,
 * whatever is installed — so it is offered first where the browser has one. It cannot be
 * decided during render: `navigator.share` exists only on the client, and guessing would
 * make the server's markup disagree with the browser's. So it appears after mount, and
 * everything else works without it. The channels are plain links: they work with the
 * page's JavaScript switched off entirely.
 *
 * Copying announces itself (WCAG 4.1.3) — a tick nobody can see has told a screen-reader
 * user nothing — and stays silent when the write actually failed, rather than claiming a
 * success that did not happen.
 */
export function ShareBar({
  url,
  title,
  channels = ['x', 'bluesky', 'linkedin', 'hackernews'],
  label = 'Share this post',
  className,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeSheet, setHasNativeSheet] = useState(false);

  /* After mount, never during render: the server has no navigator. */
  useEffect(() => {
    setHasNativeSheet(canShareNatively());
  }, []);

  /* The tick is a confirmation, not a state: it goes away on its own. */
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    /* False when the clipboard was denied, or on an insecure origin. Say nothing
       rather than claim a success that did not happen. */
    if (await copyText(url)) setCopied(true);
  };

  /* Every outcome ends the same way here: a dismissed sheet is not an error, and for
     one that failed the channels are right there, one tap away. */
  const openNativeSheet = () => {
    void shareNatively({ url, title });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="font-mono text-2xs text-muted-foreground">share</span>

      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label={label}
      >
        {hasNativeSheet ? (
          <button type="button" onClick={openNativeSheet} className={ACTION}>
            <ShareIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">Share</span>
          </button>
        ) : null}

        {channels.map((key) => {
          const Icon = ICONS[key];

          return (
            <Link
              key={key}
              href={shareHref(key, { url, title })}
              variant="plain"
              className={ACTION}
            >
              <Icon aria-hidden="true" className="size-4" />
              {/* Inside the link, not an aria-label: a label would override the
                  content and with it Link's "(opens in a new tab)" hint. */}
              <span className="sr-only">
                Share on {SHARE_CHANNEL_NAMES[key]}
              </span>
            </Link>
          );
        })}

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
