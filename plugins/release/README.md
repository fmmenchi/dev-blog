# @dev-blog/release

Release-time automation. Currently one thing: announce a freshly cut release to Slack.

The `notify` executor (`@dev-blog/release:notify`) reads everything from the environment
and posts through the tested `@dev-blog/notify` client — never `curl`, because the
failure that actually happens is Slack answering `200` while refusing the message, and
only a unit test pins that down.

| Env var            | Meaning                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `SLACK_BOT_TOKEN`  | Bot token (`xoxb-…`) with `chat:write`. Absent → step skips.      |
| `SLACK_CHANNEL_ID` | Channel ID (`C…`), not the name. Absent → step skips.             |
| `RELEASE_VERSION`  | The version without its leading `v`. Empty → nothing to announce. |
| `RELEASE_URL`      | Link the "View release" button points at (the GitHub release).    |

Missing secrets and an empty `RELEASE_VERSION` both exit green: a fork must not go red
over a notification it was never configured to send, and a push that cuts no tag has
nothing to say.

The CI wiring lives in `.github/workflows/ci.yml`, in the `release` job: it captures the
tag before and after `nx release`, and runs this only when a new one appeared.
