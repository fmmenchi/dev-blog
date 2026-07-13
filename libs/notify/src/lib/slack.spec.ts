import { alertBlocks, postToSlack } from './slack.js';

const message = {
  token: 'xoxb-test',
  channel: 'C0123',
  text: 'the scan went red',
};

/** Slack's shape: a status code, and the truth somewhere else entirely. */
function slackReplies(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('postToSlack', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the message with the bot token', async () => {
    const fetchMock = slackReplies({ ok: true });

    await postToSlack({ ...message, blocks: alertBlocks('red', 'https://x') });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://slack.com/api/chat.postMessage');
    expect(init.headers.Authorization).toBe('Bearer xoxb-test');

    const sent = JSON.parse(init.body);
    expect(sent.channel).toBe('C0123');
    /* The fallback text is what the phone notification actually shows. */
    expect(sent.text).toBe('the scan went red');
    expect(sent.blocks).toHaveLength(2);
  });

  /*
   * The reason this library exists at all. Slack answers 200 and REFUSES, putting the
   * failure in the body. Verified against the live API with an invalid token: HTTP 200,
   * {"ok": false, "error": "invalid_auth"}.
   *
   * A caller that trusts the status code reports success and delivers nothing.
   */
  it('throws when Slack refuses the message, despite the 200', async () => {
    slackReplies({ ok: false, error: 'invalid_auth' }, 200);

    await expect(postToSlack(message)).rejects.toThrow(/invalid_auth/);
  });

  it('names not_in_channel, the one everybody hits', async () => {
    /* Valid token, real channel — and the bot was never invited to it. */
    slackReplies({ ok: false, error: 'not_in_channel' }, 200);

    await expect(postToSlack(message)).rejects.toThrow(/not_in_channel/);
  });

  it('throws when Slack cannot be reached at all', async () => {
    slackReplies({}, 503);

    await expect(postToSlack(message)).rejects.toThrow(/HTTP 503/);
  });
});

describe('alertBlocks', () => {
  it('carries a link back to what produced the alert', () => {
    const blocks = alertBlocks('the scan went red', 'https://ci/run/1');

    /* An alert you cannot act on is noise. */
    const button = (blocks[1] as { elements: { url: string }[] }).elements[0];
    expect(button.url).toBe('https://ci/run/1');
  });
});
