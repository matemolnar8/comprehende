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
- pr PR #144
  https://github.com/matemolnar8/vitadeck/pull/144
- ticket #109
  https://github.com/matemolnar8/vitadeck/issues/109
- ticket #110
  https://github.com/matemolnar8/vitadeck/issues/110
- ticket #111
  https://github.com/matemolnar8/vitadeck/issues/111
- pr PR #145
  https://github.com/matemolnar8/vitadeck/pull/145
- pr-comment chatgpt-codex-connector on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406953125
- pr-comment matemolnar8 on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406956973

The title:

feat(host-control): let Deck Apps call linked computers through built-in and custom plugins

The why:

A Deck App had no way to reach the computer next to it, as [PR #144](source:s1) puts it.

The what (very large):

Host Control lets a Deck App call typed commands on a linked computer through built-in and custom plugins, with events, a demo and docs.

Things to check:
- [#109](source:s2) asks for `createHostClient({ url, transport, timeoutMs })`. At head it takes the plugin first, then options with `hostId`, `url`, `transport` and `timeoutMs`. [PR #144](source:s1) says `createHostClient(plugin, { hostId })` supports several machines.
- [#109](source:s2) asks for flat commands behind `defineHostCommands`, and `HostCapabilities.commands` as a `string[]`. At head commands sit in plugins that `defineHostPlugin` builds, the wire request carries `plugin`, and capabilities list plugins. [PR #144](source:s1) lists this as a deviation.
- [#111](source:s4) asks for `src/host_control/listener.c` on port 8798, falling forward through 10 ports. At head `src/net/lan_listener.c` binds 8787 and falls forward through 8796, as [PR #144](source:s1) says.
- [#111](source:s4) says the listener's only route is `POST /link`. At head the same listener also routes `POST /upload` and serves the upload page at `GET /`, since [PR #144](source:s1) shares it with Runtime Upload.
- [#111](source:s4) starts the listener when the Host Control screen opens and stops it on a successful link, with Runtime Upload untouched. [PR #144](source:s1) says it starts at boot with a Shell toggle and is shared with Runtime Upload.
- [#111](source:s4) handles connections inline with a 2 s receive timeout. At head `accept_thread` starts a handler thread per connection, with a 15 s receive timeout.
- [#111](source:s4) keeps one current link in `host-control-link.json` and deletes that file on forget. At head `host-control-links.json` holds a newest-first list, and the file goes only when the last link is forgotten. [PR #144](source:s1) says VitaDeck keeps several links.
- [#109](source:s2) and [#111](source:s4) name `nativeGetHostControlUrl()`, which `host` reads on every call. At head the getter is `nativeGetHostControlLinks()`, a JSON array, and `host` calls use its first entry.
- [#109](source:s2) puts the SDK tests in `src/host-control/*.test.ts`. At head one file, `js/packages/sdk/test/host-control.test.ts`, holds them.

## Review concerns

### 01 SDK plugin contract (`contract`)

The SDK's wire types and plugin registry, which Deck Apps import and the companion implements.

[groups/contract.md](groups/contract.md)

### 02 Shared contract fixtures (`fixtures`)

Ten request and reply pairs that the SDK, the companion and the C link harness replay, per [#109](source:s2).

Depends on:
- 01 SDK plugin contract (`contract`)

[groups/fixtures.md](groups/fixtures.md)

### 03 SDK host client (`client`)

`createHostClient` posts each command to a linked computer with a 5 s timeout, never rejects, and defaults to the first linked host.

Questions:
- Why does `createHostClient` take the plugin as its first argument, not options alone?

Depends on:
- 01 SDK plugin contract (`contract`)

[groups/client.md](groups/client.md)

### 04 JSON and file helpers (`helpers`)

Adds the JSON parser and file-replace helpers that the link store calls, and trims 74 lines from two storage files.

[groups/helpers.md](groups/helpers.md)

### 05 Link store (`link-store`)

Parses `POST /link` bodies and keeps a newest-first list of links on disk. A relink for an unknown computer answers 404 `unknown_link`.

Questions:
- Why keep a list of links, not the one current link #111 asked for?

Depends on:
- 04 JSON and file helpers (`helpers`)

[groups/link-store.md](groups/link-store.md)

### 06 HTTP parser moves to net (`http`)

Runtime Upload's request parsing and reply helpers move from `src/upload/` into `src/net/http.c`, which the LAN Listener now calls.

[groups/http.md](groups/http.md)

### 07 LAN Listener (`listener`)

One listener on 8787 to 8796 serves Runtime Upload, the link route and the upload page. The `/link` route saves a link with no credential check.

Attention (risk):
The listener takes `POST /link` from any LAN peer with no credential check, and the newest link becomes the default host, so Deck App commands, payloads included, go to the URL that peer named. [PR #144](source:s1) names this until credentials exist.

Depends on:
- 06 HTTP parser moves to net (`http`)
- 05 Link store (`link-store`)

[groups/listener.md](groups/listener.md)

### 08 LAN address per platform (`platform`)

Each platform detects the address the Shell shows for the listener, and the build lists the new sources.

Depends on:
- 07 LAN Listener (`listener`)

[groups/platform.md](groups/platform.md)

### 09 Linked hosts for JS (`js-getter`)

The JS runtime gets `nativeGetHostControlLinks()`, which returns the stored links as a JSON array.

Depends on:
- 05 Link store (`link-store`)

[groups/js-getter.md](groups/js-getter.md)

### 10 Shell link row and screen (`shell`)

[PR #144](source:s1) adds an Upload and link row and a Host Control screen to the Shell. Commit subjects also name Home focus fixes here; those hunks were not fetched.

Depends on:
- 07 LAN Listener (`listener`)
- 09 Linked hosts for JS (`js-getter`)

[groups/shell.md](groups/shell.md)

### 11 Companion HTTP server (`companion-server`)

Serves `/command` with a peer check, a 64 KiB body cap, and one log line per request.

Attention (risk):
With no linked Vita, every peer passes the check. Once one is linked, only its IP, loopback and this computer's own addresses do. [#110](source:s3) says IPs can be spoofed, so this is no credential.

Depends on:
- 01 SDK plugin contract (`contract`)

[groups/companion-server.md](groups/companion-server.md)

### 12 Companion plugin loader (`companion-plugins`)

Loads installed and `--plugin` packages into the companion, and its tests build a sample package to load.

Depends on:
- 01 SDK plugin contract (`contract`)

[groups/companion-plugins.md](groups/companion-plugins.md)

### 13 Companion built-in plugins (`companion-builtins`)

The `core` plugin answers capabilities, echo, events and notify, and `systemStats` samples CPU and memory.

Depends on:
- 01 SDK plugin contract (`contract`)

[groups/companion-builtins.md](groups/companion-builtins.md)

### 14 Companion link to a Vita (`companion-link`)

`linkVita` parses the Vita's address and posts the companion's link to its `/link` route.

Depends on:
- 11 Companion HTTP server (`companion-server`)

[groups/companion-link.md](groups/companion-link.md)

### 15 Companion CLI (`companion-cli`)

Runs `start`, `link`, `install`, `remove` and `notify`. On start it relinks each linked Vita, one attempt at a time.

Attention (risk):
`install` loads a package's code into the running companion, so its commands run with your permissions. Before the rename, `install` adds only the load and the built-in id check.

Depends on:
- 11 Companion HTTP server (`companion-server`)
- 14 Companion link to a Vita (`companion-link`)
- 12 Companion plugin loader (`companion-plugins`)
- 13 Companion built-in plugins (`companion-builtins`)

[groups/companion-cli.md](groups/companion-cli.md)

### 16 Companion config and package (`companion-config`)

A private, dependency-free bundle with its config file and README, per [PR #144](source:s1).

Depends on:
- 15 Companion CLI (`companion-cli`)

[groups/companion-config.md](groups/companion-config.md)

### 17 Plugin package build (`sdk-package`)

The SDK's build writes a `.vdplugin` folder and zip from `hostPlugin`, and `create` takes both host-plugin flags.

Depends on:
- 01 SDK plugin contract (`contract`)

[groups/sdk-package.md](groups/sdk-package.md)

### 18 Deck App host scaffold (`app-scaffold`)

`create --host-plugin` adds a `host/` folder with a plugin, its companion implementation and a Deck App screen.

Depends on:
- 17 Plugin package build (`sdk-package`)

[groups/app-scaffold.md](groups/app-scaffold.md)

### 19 Standalone plugin scaffold (`standalone-scaffold`)

`create --host-plugin-only` makes a project with no Deck App entry, whose registry any Deck App can import.

Depends on:
- 17 Plugin package build (`sdk-package`)

[groups/standalone-scaffold.md](groups/standalone-scaffold.md)

### 20 Checks and scripts (`checks`)

Adds the Host Control tests to the root scripts and `scripts/agent-check.sh`, per [#109](source:s2).

[groups/checks.md](groups/checks.md)

### 21 Companion event log (`events-log`)

Keeps each plugin's recent events, and `core.events` answers from the log or holds the request until the next event.

[groups/events-log.md](groups/events-log.md)

### 22 SDK event watch (`events-watch`)

`watchHostEvents` keeps one `events` wait open and retries after 5 s, or 30 s after a timeout. A throw from the callback stops the watch and fails the Deck App.

Depends on:
- 21 Companion event log (`events-log`)

[groups/events-watch.md](groups/events-watch.md)

### 23 Native fetch cancels on stop (`fetch-cancel`)

Native `fetch` cancels pending requests when a Deck App stops, so a held event wait never stalls a reload, per [PR #144](source:s1).

[groups/fetch-cancel.md](groups/fetch-cancel.md)

### 24 Host Control demo app (`demo`)

A demo Deck App lists linked computers with polled CPU, and shows the selected one's gauges and details.

[groups/demo.md](groups/demo.md)

### 25 ADR and project docs (`docs`)

The ADR, `CONTEXT.md`, `AGENTS.md` and the READMEs describe the rewritten design, per [PR #144](source:s1).

[groups/docs.md](groups/docs.md)

### 26 Agent skills (`skills`)

A new `vitadeck-host-control` skill, with Host Control notes in the other skills, per [PR #144](source:s1).

[groups/skills.md](groups/skills.md)