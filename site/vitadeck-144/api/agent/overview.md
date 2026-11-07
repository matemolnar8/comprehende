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

Named refs at pin: a447e3b9 ... ae5083ca

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
- pr PR #144 Host Control, plugins, events, LAN Listener; closes #109–#111
  https://github.com/matemolnar8/vitadeck/pull/144
- ticket #109
  https://github.com/matemolnar8/vitadeck/issues/109
- ticket #110
  https://github.com/matemolnar8/vitadeck/issues/110
- ticket #111
  https://github.com/matemolnar8/vitadeck/issues/111
- pr PR #145 Built-in plugins, .vdplugin packages, vitadeck-host-companion CLI
  https://github.com/matemolnar8/vitadeck/pull/145
- pr-comment chatgpt-codex-connector on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406953125
- pr-comment matemolnar8 on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406956973
- commit fix(shell): an empty Shell focuses Host Control so Cross keeps listening

The title:

Let Deck Apps call linked computers through built-in and custom plugins

The why:

Per [PR #144](source:s1), a Deck App had no way to reach the computer next to it.

The what (very large):

Adds Host Control: an SDK client, the Host Companion, plugin packages, and a boot-time LAN Listener with Shell linking.

Things to check:
- [#111](source:s4) asks for a separate link listener on port 8798 that runs only while the Shell Host Control Screen is open, stops after a link, and leaves Runtime Upload untouched. At head `POST /link` is a route on the LAN Listener at 8787, which `main.c` starts at boot, and the harness asserts it keeps running after a link. [PR #144](source:s1) says the separate listener felt clunky after testing.
- [#109](source:s2) specifies a flat command registry: `host.<name>()`, an internal `defineHostCommands`, and `HostCapabilities.commands` as a `string[]`. At head commands live in public `defineHostPlugin` plugins, each request carries a `plugin` field, and capabilities lists `plugins`. [PR #144](source:s1) lists the plugin model as a deviation.
- [#109](source:s2) names the getter `nativeGetHostControlUrl(): string`, and [#111](source:s4) stores one link in `host-control-link.json`. At head `nativeGetHostControlLinks()` returns a JSON array of up to 4 links from `host-control-links.json`, keyed by a companion `id`. [PR #144](source:s1) lists several links as a deviation.
- [#109](source:s2) puts the SDK tests in `src/host-control/*.test.ts`, run by a new `test:sdk` script in the `fast` tier. At head they are `js/packages/sdk/test/host-control.test.ts`, picked up by widening the existing `test:cli` glob; no `test:sdk` script exists, and no source gives a reason.
- [#110](source:s3) targets Node 22+, runs the companion from source with tsx, and keeps `{ port, advertise, vita, enable }` in its config. At head the published bin is a rolldown bundle whose README asks for Node.js 24, and the config holds `id`, `name`, `port`, `advertise` and a `vitas` array with no `enable`. [PR #145](source:s5) explains the bundle; no source gives the Node 24 floor.
- [PR #144](source:s1) says the first `start` needs the computer's firewall prompt accepted, since the Vita connects in to port 8797; the companion README gives the macOS, Windows and Linux steps.

## Review concerns

### 01 Wire contract and plugin registry (`contract`)

`protocol.ts` fixes the wire codes and request shapes, and `plugin.ts` defines plugins that Deck Apps import and the companion implements. The ten JSON fixtures pin the bytes that the SDK, companion and C harness all replay.

Attention (contract):
`ImplementedHostPlugin` (a string `id` plus a `ReadonlyMap` of `isPayload`/`run`) and `HOST_PLUGIN_SCHEMA_VERSION` 1 are what a `.vdplugin` built with one SDK promises a companion of another. Each package bundles its own copy of this module, so the companion matches that shape, and `HostCommandError` by `name`, not by class. Renaming the error class or changing `commands` from a `Map` breaks every package already built.

[groups/contract.md](groups/contract.md)

### 02 Deck App client and event watching (`client`)

`client.ts` turns a plugin into typed methods that resolve to `HostResult` and never reject, reading the links from `nativeGetHostControlLinks` on every call. `watchHostEvents` keeps one `core.events` wait open, passing `next` back as `after`.

Attention (tradeoff):
The Vita `fetch` has no `AbortSignal`, so `send` races the request against a 5 s timer and never retries. After a `timeout` the native request keeps running up to curl's 30 s cap, and the command may still run on the computer. `watchHostEvents` therefore waits 30 s before retrying a timed-out wait, and gives each wait 29 s against the companion's 25 s hold.

Depends on:
- 01 Wire contract and plugin registry (`contract`)

[groups/client.md](groups/client.md)

### 03 Companion server and events (`companion-server`)

`startHostCompanion` serves `POST /command`, checking route, method, content type, size, version, plugin, command and payload guard in order, and `events.ts` holds `core.events` waits until the plugin emits. As [chatgpt-codex-connector asked](source:s6), `reply` checks the peer before reading the body.

Attention (risk):
`isAllowed` answers every peer while the config's `vitas` list is empty, so a companion that was started but never linked serves any LAN host. Once linked, it answers those Vita IPs, loopback and this computer's own addresses, all spoofable. The built-ins only read, so today the exposure is `echo`, `notify`, system stats, and any installed custom plugin.

Depends on:
- 01 Wire contract and plugin registry (`contract`)

[groups/companion-server.md](groups/companion-server.md)

### 04 Companion linking and relink (`companion-link`)

`linkVita` checks that `start` answers on loopback, picks the interface routed to the Vita, and posts the link; `relink` in `cli.ts` replays it for each saved Vita on every `start`. A Vita that answers `unknown_link` is removed from `vitas`.

Attention (tradeoff):
The config stores Vita IPs without ports, and `relink` calls `linkVita(vita, …)`, which defaults to port 8787. A Vita whose LAN Listener fell forward to 8788 refuses the connection, which `linkVita` marks `retry: true`, so the companion retries it every 30 s for as long as it runs. The companion README says such a Vita needs `link` again.

Depends on:
- 03 Companion server and events (`companion-server`)

[groups/companion-link.md](groups/companion-link.md)

### 05 Companion plugin packages (`companion-plugins`)

`plugin.ts` loads a `.vdplugin` folder by its manifest and unpacks a `.vdplugin.zip` safely, and `cli.ts` installs, removes, watches and reloads packages, keeping the previous set when a load fails. `cli.ts` also holds the relink code from the linking group.

Attention (tradeoff):
Each reload imports the package entry under a new `?v=<sha256>` query, so a rebuild is not served from the module cache. Node never unloads ESM modules, so a long `pnpm host` session keeps every rebuilt copy, with anything it allocated at module load, in memory. Lifecycle `stop` functions end timers, but module-level state stays.

Depends on:
- 03 Companion server and events (`companion-server`)

[groups/companion-plugins.md](groups/companion-plugins.md)

### 06 vitadeck build and create plugins (`sdk-cli`)

`vitadeck build` writes `<slug>.vdplugin` and its zip from `hostPlugin`, `entry` becomes optional, and `create` gains `--host-plugin` and `--host-plugin-only` templates. `dev` takes no URL for a plugin-only project and rejects one, and requires it otherwise.

Depends on:
- 05 Companion plugin packages (`companion-plugins`)

[groups/sdk-cli.md](groups/sdk-cli.md)

### 07 Shared JSON and file-replace helpers (`json-file-helpers`)

`json.c` takes `json_skip_value` from `package_manifest.c` and the JSON escaper from the upload code, and `util.c` takes the Vita-safe replace from `deck_app_storage.c`, so the link store can reuse both. The moved code is unchanged apart from names.

[groups/json-file-helpers.md](groups/json-file-helpers.md)

### 08 Native link store and getter (`native-link`)

`link.c` parses `POST /link` bodies and keeps up to 4 links in `host-control-links.json`, newest first, and `jslib/host_control.c` exposes them as `nativeGetHostControlLinks`. `bootstrap.c` loads the store at boot and fails startup if it cannot.

Attention (product):
`host_control_links_save` puts a new companion id first and drops the oldest past `VD_HOST_CONTROL_MAX_LINKS` (4) without telling anyone. Linking a fifth computer silently forgets the least recently linked one. That companion's next `start` relink then gets `unknown_link` and removes this Vita from its config.

Questions:
- Why does `VD_HOST_CONTROL_MAX_LINKS` cap VitaDeck at 4 linked computers?

Depends on:
- 07 Shared JSON and file-replace helpers (`json-file-helpers`)
- 01 Wire contract and plugin registry (`contract`)

[groups/native-link.md](groups/native-link.md)

### 09 LAN Listener on from boot (`lan-listener`)

The upload server becomes `lan_listener.c` with a `POST /link` route, its HTTP helpers move to `src/net/http.c`, and `main.c` starts it at boot. [PR #144](source:s1) says the Vita VPK builds, but nothing was tested on hardware.

Attention (risk):
`shell_start_listener` in `main.c` binds the LAN Listener on all interfaces at boot, and nothing checks who calls `POST /upload` or `POST /link`. While VitaDeck runs, anyone on the LAN can install or replace a Deck App, the active one included, or add a link that points Deck Apps at their own server. Turning **Upload and link** off lasts only until VitaDeck restarts.

Depends on:
- 08 Native link store and getter (`native-link`)

[groups/lan-listener.md](groups/lan-listener.md)

### 10 Shell link toggle and screen (`shell`)

Home gains the **Upload and link** toggle and a **Host Control** row that opens a screen listing linked computers with the `link` command to run. `keep_entry_focus` keeps focus on an entry row when an upload adds a package above it.

Attention (product):
Cross on a computer in the Host Control screen calls `host_control_links_forget` at once with no confirm step, as [#111](source:s4) asks. A forgotten computer does not come back by itself: its companion's next relink gets `unknown_link` and drops this Vita, so the user must run `link` on that computer again.

Depends on:
- 09 LAN Listener on from boot (`lan-listener`)

[groups/shell.md](groups/shell.md)

### 11 Cancel fetches when a Deck App stops (`fetch-cancel`)

`fetch_shutdown` marks every pending request cancelled, and the new curl progress callback aborts it. `js_limits_harness` stops a Deck App whose fetch waits on a server that never answers.

Attention (tradeoff):
curl aborts a cancelled transfer only at its next progress callback, about once a second. Stopping a Deck App can still wait about a second for held event waits, instead of up to 30 s. The progress callback, with its mutex lock, now runs on every Deck App fetch.

Depends on:
- 02 Deck App client and event watching (`client`)

[groups/fetch-cancel.md](groups/fetch-cancel.md)

### 12 Host Control demo Deck App (`example`)

`js/examples/host-control` lists linked computers with live CPU, and for the selected one shows capabilities, gauges, an Echo round trip and `core` notices. It polls `systemStats` one request at a time per computer, backing off to 30 s after a `timeout`.

Depends on:
- 02 Deck App client and event watching (`client`)

[groups/example.md](groups/example.md)

### 13 ADR, glossary, READMEs and skills (`docs`)

ADR 0004, `CONTEXT.md`, `AGENTS.md`, the SDK and companion READMEs and the agent skills describe Host Control, and say Runtime Upload now listens from startup. A new `vitadeck-host-control` skill covers linking, plugin authoring and error codes.

[groups/docs.md](groups/docs.md)