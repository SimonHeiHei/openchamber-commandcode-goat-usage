# CommandCode Goat Usage for OpenChamber

An [OpenChamber](https://openchamber.dev) extension that puts your **CommandCode Goat** subscription quota and your **local OpenCode token cost** in one rail panel.

English · [中文说明](README.zh-CN.md)

The panel follows your OpenChamber language: Chinese hosts get Chinese, everything else gets English.

## What it shows

- **Core metrics** — four cards above the quota bars, for the current billing period: requests (with the failed count), success rate, cost (with the credits it was drawn from) and tokens (with the input / output split).
- **Three quota bars** — the rolling 5-hour window, the rolling weekly window, and the monthly credit pool. Each shows its remaining amount and a live reset countdown, and escalates from neutral to warning (≥ 60%) to error (≥ 90%).
- **Billing period** — the plan id, the subscription status, and the current period (start → end). The refresh control sits at the right end of that row.
- **Local cost, as charts** — pick today, this week, this month or all time. The current week is a **stacked column chart** (cost per day, split by model, with a colour legend); hovering a segment shows that day and model's cost, tokens, turns and conversations. The current month is a **calendar heat grid** (cost per day, intensity scaled to the month); today shows no day view. Every range ends with a **horizontal per-model ranking** — cost, turns, conversations, tokens and cache hit rate, largest first.
- **Rail badge** — the share of the weekly window you still have left, drawn on the extension's icon.

Two notes on the numbers: token figures are shown in millions (`M`), and a day whose recorded cost is zero shows `$0.00` rather than a dash — models without a configured price are recorded at cost 0 and OpenCode never backfills, so a day can hold real work with a zero bill.

## Requirements

| | |
|---|---|
| OpenChamber | **1.24.0 or newer** — the extension SDK shipped in that release. Older hosts refuse the install with `host-too-old`. |
| CommandCode | a Goat subscription whose API key is registered in OpenCode (`~/.local/share/opencode/auth.json`). |
| Platform | OpenChamber web and desktop, on macOS, Linux and Windows. VS Code and mobile do not load extensions. |

The quota half needs a CommandCode key. **Without one the extension still works**: local token cost is shown as usual, with a notice explaining that the quota half is unavailable.

## Install

OpenChamber → **Settings → Extensions** → paste this into the *Folder, ZIP, or URL* field:

```
https://github.com/SimonHeiHei/openchamber-commandcode-goat-usage
```

Approve the permission dialog. OpenChamber clones the repository, installs it under its own data directory, and offers an update whenever the `version` in this repository increases.

## The permission it asks for

Installing requests exactly one capability: **`service`** — a local process this extension starts alongside OpenChamber.

Be aware of what that means. In OpenChamber's own words the permission list is advisory and **no OS sandbox is applied**: a guest service runs with your user rights and can read or write anything you can. So read the code before approving it. It is a single file, [`service/main.js`](service/main.js), and it does exactly three things:

1. reads your CommandCode API key from OpenCode's `auth.json`;
2. reads your OpenCode SQLite database in read-only mode to total local token cost;
3. makes three read-only `GET` requests to `https://api.commandcode.ai` for your quota and usage.

It binds `127.0.0.1` on a host-allocated port, requires the host-issued bearer token on every request, never writes a file, never stores anything, and sends nothing anywhere except those three requests.

## Privacy

- The API key never leaves the service process: it is not returned in any response, not written to a log, and never reaches the panel.
- Your account identity is never requested: the extension does not call the account endpoint at all, so your name and email are not fetched.
- The panel is a sandboxed iframe with no network access and no filesystem access; it reads JSON from the service only, through the host.
- No telemetry and no analytics. The only network endpoints are `api.commandcode.ai`.
- Nothing is persisted to disk by this extension.

## How it works

```
panel (sandboxed iframe, classic IIFE)
  └─ host.serviceRequest ──► OpenChamber host ──► 127.0.0.1:<port> ──► service/main.js
                                                                        ├─ auth.json          (your key)
                                                                        ├─ opencode.db        (read-only totals)
                                                                        └─ api.commandcode.ai (quota, read-only)
```

The panel talks to nothing directly. The host spawns the service on first use and stops it when OpenChamber quits.

## Data sources

| Section | Source |
|---|---|
| plan, credits, windows | `GET /alpha/billing/subscriptions`, `/alpha/billing/credits` |
| billing-period usage | `GET /alpha/usage/summary` |
| local cost | your `opencode.db` (`message` table, assistant rows) |

The rolling windows and their caps are CommandCode's own values; this extension only displays them.

## Development

```bash
npm install       # @openchamber/sdk + esbuild, build-time only
npm run build     # re-bundles panel/src/main.js → panel/main.js
npm run check     # syntax-checks both shipped scripts
```

`panel/main.js` **is committed on purpose.** An OpenChamber guest package is never compiled by the host, so the built bundle has to ship in the repository. Edit `panel/src/main.js`, rebuild, and never hand-edit the bundle.

Releases: bump `version` in `package.json`. That is the value OpenChamber compares against this repository to offer an update. Note that a release which requests *more* capabilities also re-triggers the approval dialog.

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Local service not ready" | the `service` capability was not approved, or the service failed to start. Re-approve it in Settings → Extensions. |
| Quota bars missing, a notice instead | no CommandCode key in `auth.json`, or the upstream request failed. Local cost still works. |
| Local cost empty | no OpenCode activity in the selected range, or the database could not be read. |
| Install refused: `host-too-old` | OpenChamber is older than 1.24.0. |
| Install refused: `missing-build` | `panel/main.js` is absent — install a release tag rather than a branch where the build was never run. |

Service errors name the exact file path they tried, which is the fastest way to diagnose a non-standard OpenCode layout.

## License

[MIT](LICENSE)
