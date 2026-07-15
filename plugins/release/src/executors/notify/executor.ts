import { postToSlack, releaseBlocks } from '@dev-blog/notify';

/**
 * Tells Slack that a new version shipped.
 *
 * It lives in TypeScript, not in curl and jq in the workflow, for the same reason the
 * security notification does: the failure that actually happens — Slack answering 200
 * while refusing the message — is testable, and a shell script is not. See
 * `@dev-blog/notify`.
 *
 * Everything comes from the environment. The secrets, because an option ends up in the
 * project graph and `nx show project` output, and a token must not. The version and the
 * release URL, because they are different on every run and known only to the job that
 * cut the tag.
 *
 * Two states short-circuit to success, and neither is a failure:
 *   - the secrets are absent — a fork, or a checkout from before the Slack app existed,
 *     must not go red over a notification it was never set up to send;
 *   - RELEASE_VERSION is empty — the release step ran but cut no new tag (a push with no
 *     releasable commits), so there is nothing to announce.
 */
export default async function runExecutor() {
  const token = process.env['SLACK_BOT_TOKEN'];
  const channel = process.env['SLACK_CHANNEL_ID'];
  const version = process.env['RELEASE_VERSION'];
  const url = process.env['RELEASE_URL'] ?? '';

  if (!token || !channel) {
    console.log(
      'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID is not set — skipping the notification.',
    );
    return { success: true };
  }

  if (!version) {
    console.log('RELEASE_VERSION is empty — no new tag to announce.');
    return { success: true };
  }

  try {
    await postToSlack({
      token,
      channel,
      /* The fallback: it is what the phone notification shows. */
      text: `dev-blog v${version} released`,
      blocks: releaseBlocks(version, url),
    });

    console.log(`Announced v${version} to Slack.`);
    return { success: true };
  } catch (error) {
    /* A notification that silently did not arrive is worse than one that failed loudly. */
    console.error(String(error));
    return { success: false };
  }
}
