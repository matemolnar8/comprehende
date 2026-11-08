Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a447e3b960dc1c5434b9fbc2f45c112b1c630b1f` and `git rev-parse --verify ae5083caa9370b5f5985de1de0aa147a1afecc2e` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: vitadeck
Origin: git@github.com:matemolnar8/vitadeck.git

base (merge-base)  a447e3b960dc1c5434b9fbc2f45c112b1c630b1f

head               ae5083caa9370b5f5985de1de0aa147a1afecc2e

Named refs at pin: a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ... ae5083caa9370b5f5985de1de0aa147a1afecc2e

Read the diff:

git diff --find-renames a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ae5083caa9370b5f5985de1de0aa147a1afecc2e

Commits:
- ae5083ca fix(host-companion): relink attempts run one at a time and re-read the config
- 2a18bdfe feat(host-control): the companion relinks its Vitas on every start
- fbb6af02 refactor(shell): read the row count once when Home opens
- df415e34 fix(shell): an install keeps Home focus on the entry row it was on
- 70e9ba2b fix(shell): an empty Shell focuses Host Control so Cross keeps listening
- f9245aa2 feat(shell): one LAN Listener for upload and link, on from startup
- 82350502 refactor(host-companion): put the lifecycle comment on the call it explains
- 18acd4f7 fix(sdk): a watch callback that stops watching ends it at once
- 7f2c1726 fix(host-companion): start plugin lifecycles after binding the port
- 20461a88 feat(host-control): computers push events to Deck Apps by long-polling
- 0ec52014 docs(skills): add vitadeck-host-control and cover Host Control in the others
- 51440f28 test(sdk): pin the standalone plugin's peer SDK and exclusive create flags
- 5820312a docs(sdk): say which SDK copy a linked standalone plugin uses
- 607fcd29 fix(sdk): standalone plugins take the SDK as a peer dependency
- c41d480c feat(sdk): Host Plugins can be authored without a Deck App
- a90a3cf6 fix(sdk): build the plugin package beside the old one and swap it in
- e069a2f5 fix(host-control): a broken plugin build keeps the last good package
- a601a6ca feat(host-control): a Deck App's plugin ships as a .vdplugin package and zip
- 96448b7b fix(host-companion): --plugin takes a directory, so the scaffold survives a renamed app
- c0498393 fix(host-companion): allow plugin ids as long as a package slug
- 445f5ef3 fix(host-companion): rename the plugin's module copy into place
- 966550e1 fix(host-companion): install renames the plugin into place
- 4139145b fix(host-companion): load plugins from file copies, resolve paths from the cwd
- 148fceef feat(host-control): built-in plugins, .vdplugin files, vitadeck-host-companion
- 04760101 fix(host-companion): reject unlinked peers before reading their body
- eb61ca83 fix(host-control): close a connection accepted while the listener stops
- 77aad963 fix(host-control): show how to link another computer after a link; help before commands
- 3d928f8d fix(host-control): review fixes for polling backoff, result spread, and listener stop
- 959cfda2 feat(examples): Host Control demo Deck App, docs, and agent-check
- 5006b10b feat(host-control): Host Control Link listener, store, getter, and Shell screen
- 9c60f8a2 feat(host-companion): Host Companion CLI and system-stats plugin
- 7130b909 fix(sdk): typecheck and lint the Host Control tests
- 8d3b93f2 feat(sdk): Host Control wire contract, plugins, and client

Sources:
- pr PR #144
  https://github.com/matemolnar8/vitadeck/pull/144
- ticket #109
  https://github.com/matemolnar8/vitadeck/issues/109
- ticket #110
  https://github.com/matemolnar8/vitadeck/issues/110
- ticket #111
  https://github.com/matemolnar8/vitadeck/issues/111
- pr PR #145 Stacked follow-up merged into this branch.
  https://github.com/matemolnar8/vitadeck/pull/145
- pr-comment chatgpt-codex-connector on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406953125
- pr-comment cursor[bot] on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#pullrequestreview-5721580682
- commit fix(shell): an empty Shell focuses Host Control so Cross keeps listening

The title:

feat(host-control): let Deck Apps call linked computers through built-in and custom plugins

The why:

A Deck App had no way to reach the computer next to it, as [PR #144](source:s1) states.

The what (very large):

Adds Host Control: linking, an SDK client, the Host Companion and a Shell screen, plus events, plugin packages, standalone plugins and agent skills.

Things to check:
- [#109](source:s2) keeps `defineHostCommands` internal, with flat command names and a `HostCapabilities.commands` list. At head `defineHostPlugin` and `implementHostPlugin` are public, requests carry `plugin`, and capabilities list `plugins`. [PR #144](source:s1) names this deviation.
- [#109](source:s2) has the client read `nativeGetHostControlUrl()`. At head it reads `nativeGetHostControlLinks()`, a JSON array of up to 4 links, and `createHostClient` takes a `hostId`. [PR #144](source:s1) says VitaDeck keeps several links.
- [#109](source:s2) asks for a new `test:sdk` script in the `fast` tier. At head there is none: `test:cli` now also runs `test/host-control.test.ts`. No source gives a reason.
- [#110](source:s3) targets Node 22+. At head the companion README and the `vitadeck-host-control` skill require Node.js 24. No source gives a reason.
- [#110](source:s3) specifies the config `{ port, advertise, vita, enable }`. At head it is `{ id, name, port, advertise, vitas }`, with no `enable`. [PR #144](source:s1) relinks every Vita a companion linked and ships only read-only built-ins.
- [#111](source:s4) has a link listener on 8798 that runs only while the Host Control screen is open. At head `POST /link` is a route on the LAN Listener, on from boot at 8787, and the harness checks it keeps running after a link. [PR #144](source:s1) says the first setup felt clunky.
- [#111](source:s4) stores one link in `host-control-link.json`. At head `host-control-links.json` holds up to 4 links, newest first, one per companion `id`. [PR #144](source:s1) lists this deviation.
- [#111](source:s4) says upload behaves exactly as before. At head upload runs from boot, and every accepted socket gets a 15 s per-read receive timeout (`VD_LAN_RECV_TIMEOUT_SEC`) that the old server did not set. No source mentions the timeout.
- [PR #144](source:s1) records that Codex flagged the unpublished `@vitadeck/host-companion` devDependency in the #145 scaffold, declined as a release decision. At head both plugin templates still list it, and `copy-templates.ts` writes `^0.1.0`.
- [Cursor's review](source:s8) rated the PR high risk and asked for human review. At head the LAN Listener starts at boot, and `/upload` and `/link` accept any LAN peer without credentials.

## Review concerns

### 01 ADR, glossary and READMEs (`docs`)

ADR 0004, `CONTEXT.md`, `AGENTS.md` and the READMEs describe the shipped design, rewritten in place.

[groups/docs.md](groups/docs.md)

### 02 Wire contract and SDK client (`contract`)

`@vitadeck/sdk/host-control` defines plugins, the wire error codes and a client that reads VitaDeck's links on every call. The SDK, companion and C harness tests replay the same fixture files.

Attention (contract):
`send` races the transport against a `setTimeout`, because the Vita `fetch` has no `AbortSignal`. A command that takes 6 s resolves `timeout` at 5 s, but the native request keeps running and the companion still runs it. Callers must read `timeout` as "may have run"; the client never retries.

[groups/contract.md](groups/contract.md)

### 03 Host Companion server and link (`companion`)

`vitadeck-host-companion` serves typed commands on port 8797, links itself to Vitas, and relinks them on every `start`. `reply` checks the peer before it reads the body, as [the Codex comment](source:s6) asked.

Attention (risk):
While `vitas` is empty, `isAllowed` answers every peer. After a link, only those IPs, loopback and the computer's own addresses get answers; any other peer gets 403 `forbidden`. IPs can be spoofed; the README accepts that because the built-in plugins only read.

Questions:
- Why does `config.vitas` keep only the Vita IP, not the port given to `link`?

Depends on:
- 02 Wire contract and SDK client (`contract`)

[groups/companion.md](groups/companion.md)

### 04 Shared replace-file and JSON helpers (`native-helpers`)

The Vita-safe file replace moves from Deck App Storage into `util.c`, and the JSON helpers move into `json.c`, so the link store and listener share them.

[groups/native-helpers.md](groups/native-helpers.md)

### 05 Native link store and getter (`link-store`)

`link.c` validates `POST /link` bodies and keeps up to 4 links, newest first; `nativeGetHostControlLinks` hands them to Deck Apps as JSON.

Attention (product):
`host_control_links_save` puts a new id first and drops the oldest past 4. A fifth computer silently evicts the oldest link. That companion's next `start` relinks, gets 404 `unknown_link`, and removes the Vita from its `vitas`.

Questions:
- Why does a relink keep the link's place while a plain `link` moves it first?

Depends on:
- 04 Shared replace-file and JSON helpers (`native-helpers`)
- 02 Wire contract and SDK client (`contract`)

[groups/link-store.md](groups/link-store.md)

### 06 One LAN Listener from boot (`lan-listener`)

The upload server becomes the LAN Listener with a `POST /link` route, and `main.c` starts it at boot. `vitadeck dev` and `vitadeck-host-companion link` now take the same address.

Attention (risk):
`main.c` calls `shell_start_listener` on every boot, also in Benchmark Mode, and `/upload` and `/link` check no peer. Anyone on the LAN can install a Deck App or add a link while VitaDeck runs, until **Upload and link** is turned off. The PR accepts this until credentials exist.

Depends on:
- 04 Shared replace-file and JSON helpers (`native-helpers`)
- 05 Native link store and getter (`link-store`)

[groups/lan-listener.md](groups/lan-listener.md)

### 07 Shell toggle and Host Control screen (`shell`)

The Shell's Upload row becomes an on/off **Upload and link** toggle, and a new Host Control screen shows the `link` command and forgets a computer on Cross.

Depends on:
- 06 One LAN Listener from boot (`lan-listener`)
- 05 Native link store and getter (`link-store`)

[groups/shell.md](groups/shell.md)

### 08 Host Control demo Deck App (`demo`)

`js/examples/host-control` polls `systemStats` on every linked computer and shows one computer's details. It polls an unanswering computer every 30 s, since a timed-out native fetch runs on that long.

Depends on:
- 02 Wire contract and SDK client (`contract`)

[groups/demo.md](groups/demo.md)

### 09 Events by long-polling (`events`)

Plugins emit events from a `start` lifecycle into the companion's event log, and `core.events` holds each request until the plugin's next event or 25 s. `watchHostEvents` in the SDK keeps one such request open per watcher.

Attention (tradeoff):
`wait` reads an `after` above the current `seq` as a restart and starts over from now. If a restarted companion emits 3 events before a wait with `after: 57`, the reply is `{ events: [], next: 3 }` and those 3 are lost. After 60 events it returns only 58 to 60. The ADR calls events best effort.

[groups/events.md](groups/events.md)

### 10 Fetch cancels on Deck App stop (`fetch-cancel`)

`fetch_shutdown` marks every pending fetch cancelled and curl's progress callback aborts it, so a held event wait no longer stalls a Deck App stop.

Attention (tradeoff):
Stopping a Deck App now aborts every pending fetch, not only event waits. A Deck App's POST still in flight at a reload is cut off within about a second. Before, the stop waited for it, up to curl's 30 s cap.

Depends on:
- 09 Events by long-polling (`events`)

[groups/fetch-cancel.md](groups/fetch-cancel.md)

### 11 SDK CLI builds plugin packages (`plugin-build`)

`vitadeck build` writes `<slug>.vdplugin` and its zip from `hostPlugin`, and `create --host-plugin` lays a plugin over the Deck App scaffold.

Attention (tradeoff):
`buildHostPlugin` bundles every import except Node built-ins into one `companion.mjs`. A dependency with a native addon cannot ship this way. The SDK README says pure JavaScript only, and sends other files to `hostPlugin.files`, which `cp` copies with links dereferenced.

[groups/plugin-build.md](groups/plugin-build.md)

### 12 Companion installs and reloads packages (`plugin-loader`)

The companion loads `.vdplugin` packages from its `plugins/` folder and each `--plugin` path, and reloads them when their files change.

Attention (risk):
`install` calls `loadHostPluginPackage` on the staged folder, which imports `companion.mjs`. The plugin's top-level code runs with the user's permissions during `install`, before any `start`. The help text and README say to install only trusted plugins.

Depends on:
- 11 SDK CLI builds plugin packages (`plugin-build`)

[groups/plugin-loader.md](groups/plugin-loader.md)

### 13 Standalone plugin projects (`standalone-plugin`)

`create --host-plugin-only` scaffolds a project with only `host/`, and its `package.json` exports the commands for Deck Apps to depend on.

Attention (contract):
`readConfig` no longer requires `entry`; a config needs `entry`, `hostPlugin`, or both. `vitadeck dev 192.168.1.50` on a plugin-only project fails with "no Deck App to upload", and `vitadeck dev` with no URL on a Deck App prints the usage.

[groups/standalone-plugin.md](groups/standalone-plugin.md)

### 14 Agent skills for Host Control (`agent-skills`)

A new `vitadeck-host-control` skill covers the companion and plugins, and the other skills drop the "open Upload first" step.

[groups/agent-skills.md](groups/agent-skills.md)