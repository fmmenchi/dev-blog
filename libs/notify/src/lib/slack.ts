const ENDPOINT = 'https://slack.com/api/chat.postMessage';

/** Block Kit, kept loose: this library does not police Slack's schema. */
export type SlackBlock = Record<string, unknown>;

export interface SlackMessage {
  /** A bot token (`xoxb-…`) carrying the `chat:write` scope. */
  token: string;
  /** Channel ID (`C…`), not the name: a renamed channel keeps its ID. */
  channel: string;
  /**
   * Plain-text fallback. NOT optional, even when blocks are given: it is what appears in
   * the phone notification, in the sidebar, and to a screen reader. A message carrying
   * only blocks arrives as an empty line.
   */
  text: string;
  blocks?: SlackBlock[];
}

interface SlackResponse {
  ok: boolean;
  error?: string;
}

/**
 * Posts to Slack, and fails loudly when Slack refuses.
 *
 * The whole reason this is a tested function and not three lines of curl: **Slack
 * answers HTTP 200 even when it rejects the message.** A bad token, a channel the bot
 * was never invited to, a malformed block — every one of them comes back 200, with
 * `{"ok": false}` in the body. Verified against the live API with a deliberately invalid
 * token: HTTP 200, `error: invalid_auth`.
 *
 * A caller that checks only the status code prints "notification sent" and sends
 * nothing. That is the exact class of silent failure this codebase keeps digging out of
 * itself — and it is something a unit test can pin down and a shell script cannot.
 */
export async function postToSlack({
  token,
  channel,
  text,
  blocks,
}: SlackMessage): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ channel, text, blocks }),
  });

  if (!response.ok) {
    /* Transport-level: Slack down, or a proxy in the way. Rare, and not the same bug. */
    throw new Error(`Slack is unreachable: HTTP ${response.status}`);
  }

  const body = (await response.json()) as SlackResponse;

  if (!body.ok) {
    /*
     * `not_in_channel` is the one everybody hits: the token is valid, the channel is
     * real, and the bot was simply never invited to it. Surfacing the code saves the
     * next person an hour of staring at a green pipeline.
     */
    throw new Error(
      `Slack refused the message: ${body.error ?? 'unknown error'}`,
    );
  }
}

/**
 * An alert with a link back to whatever produced it.
 *
 * A notification you cannot act on is noise. The button is the difference between "the
 * scan is red" and "here is the scan".
 */
export function alertBlocks(message: string, url: string): SlackBlock[] {
  return [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: message },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'See the run' },
          url,
        },
      ],
    },
  ];
}

/**
 * Announces a release, with a link to its notes.
 *
 * Deliberately not `alertBlocks`: a release is not something that went wrong, so it does
 * not borrow the alarm's framing or its "See the run" wording. The button points at the
 * GitHub release, which is the one thing a reader actually wants after "a version shipped".
 *
 * `version` is the tag without its leading `v` — `1.0.0`, not `v1.0.0` — because the
 * heading adds the `v` back, and the caller (a git tag) is the one place the two forms
 * are easy to confuse.
 */
export function releaseBlocks(version: string, url: string): SlackBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:rocket: *dev-blog \`v${version}\`* is out.`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View release' },
          url,
        },
      ],
    },
  ];
}
