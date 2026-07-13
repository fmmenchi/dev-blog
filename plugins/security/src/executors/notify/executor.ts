import { alertBlocks, postToSlack } from '@dev-blog/notify';

import type { NotifyExecutorSchema } from './schema';

/**
 * Tells Slack that a scheduled scan went red.
 *
 * It lives here, in TypeScript, rather than as curl and jq in a workflow, for one
 * reason: the thing that can actually go wrong — Slack answering 200 while refusing the
 * message — is testable, and a shell script is not. See `@dev-blog/notify`.
 *
 * The secrets come from the environment, never from options: an option ends up in the
 * project config, in the graph, and in `nx show project` output. A token does not.
 *
 * Missing secrets are NOT a failure. The workflow must still be usable in a fork, or
 * before anyone has created the Slack app — CI going red because a notification was not
 * configured would be a check failing over its own plumbing.
 */
export default async function runExecutor(options: NotifyExecutorSchema) {
  const token = process.env['SLACK_BOT_TOKEN'];
  const channel = process.env['SLACK_CHANNEL_ID'];
  const url = process.env['RUN_URL'] ?? '';

  if (!token || !channel) {
    console.log(
      'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID is not set — skipping the notification.',
    );
    return { success: true };
  }

  try {
    await postToSlack({
      token,
      channel,
      /* The fallback: it is what the phone notification shows. */
      text: options.message,
      blocks: alertBlocks(options.message, url),
    });

    console.log('Posted to Slack.');
    return { success: true };
  } catch (error) {
    /* A notification that silently did not arrive is worse than one that failed loudly. */
    console.error(String(error));
    return { success: false };
  }
}
