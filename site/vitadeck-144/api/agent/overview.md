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
- pr-comment chatgpt-codex-connector on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406953125
- pr-comment cursor[bot] on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#pullrequestreview-5690783768
- ticket #109
  https://github.com/matemolnar8/vitadeck/issues/109
- ticket #110
  https://github.com/matemolnar8/vitadeck/issues/110
- ticket #111
  https://github.com/matemolnar8/vitadeck/issues/111

The title:

Let Deck Apps call linked computers through built-in and custom plugins

The why:

[PR #144](source:s1) says a Deck App had no way to reach the computer next to it.

The what (very large):

Adds Host Control: a Vita links to a computer's Host Companion, Deck Apps call its built-in and custom plugins, and computers can push events to Deck Apps.

Things to check:
- [#109](source:s6) asks for flat commands that authors call but do not define. At head authors define `defineHostPlugin` plugins, and the wire request gains a `plugin` field. [PR #144](source:s1) lists the plugins as a deviation.
- [#109](source:s6) asks for `HostCapabilities.commands` as a `string[]`. At head `capabilities` returns `plugins`, each with its own `commands`. No source gives a reason.
- [#109](source:s6) has the default `host` read `nativeGetHostControlUrl()`. At head the client reads `nativeGetHostControlLinks()`, a JSON array, and calls take a `hostId`. [PR #144](source:s1) lists the array as a deviation.
- [#110](source:s7) puts an `enable` list in the config, which would keep computer-acting commands off until named. At head `config.ts` has no `enable` field, and no source gives a reason.
- [#110](source:s7) keeps one `vita` address in the config. At head the config holds a `vitas` list, and no source gives a reason.
- [#111](source:s8) binds the link listener on 8798, and its Shell screen shows `Link address: 192.168.1.177:8798`. At head the LAN Listener binds 8787 and falls forward, and the screen shows the `vitadeck-host-companion link` command with its address. [PR #144](source:s1) says links share that listener after testing.
- [#111](source:s8) stops the listener when a link succeeds, on Circle, and on Start. At head only the Shell Listener Entry or VitaDeck's exit stops it, so Circle and Start leave it running.
- [#111](source:s8) keeps one link in `host-control-link.json`, and forgetting it deletes the file. At head the store keeps up to four links in `host-control-links.json`, and forgetting one leaves the rest. [PR #144](source:s1) lists several links as a deviation.
- [#111](source:s8) makes `POST /link` the only route on the link listener. At head `/link` shares port 8787 with `POST /upload` and `GET /`.
- [PR #144](source:s1) says Codex flagged the companion devDependency as unpublished, and declined the fix as a release decision. At head `copy-templates` still pins `@vitadeck/host-companion` to `^0.1.0`, which is not on npm.
- The review bot on the PR says human review is needed and no reviewers were assigned ([cursor[bot]](source:s5)). [PR #144](source:s1) says three review loops ran, each with Claude and Muse, and names no human reviewer.

## Review concerns

### 01 Wire contract and plugin registry (`contract`)

The SDK defines the Host Control envelope, wire error codes and plugin registries that Deck Apps and the companion share. The fixtures pin one reply per case for the SDK, companion and native tests.

[groups/contract.md](groups/contract.md)

### 02 Shared JSON and file replacement (`native-helpers`)

Moves the JSON helpers into `core/json` and the write-then-rename routine into `vd_replace_file`, which Deck App Storage and the link store share.

[groups/native-helpers.md](groups/native-helpers.md)

### 03 Link store and getter (`link-store`)

Keeps up to four Host Control Links in `host-control-links.json`, newest first, one per companion id, and answers the JS getter on every call.

Questions:
- Why does a relink keep its list position, while a new link moves to the front?

Depends on:
- 02 Shared JSON and file replacement (`native-helpers`)

[groups/link-store.md](groups/link-store.md)

### 04 LAN Listener serves uploads, links (`lan-listener`)

The upload server becomes the LAN Listener, which also answers `POST /link` and starts at boot. Its request parsing and JSON replies move into `net/http.c`.

Attention (risk):
The listener runs from boot, and `POST /link` and `POST /upload` answer any LAN peer. `handler_thread` picks the route from the request line, and nothing checks the peer or a credential first. A peer can add a link or install a Deck App whenever VitaDeck runs, which ADR 0004 accepts until credentials exist.

Depends on:
- 03 Link store and getter (`link-store`)

[groups/lan-listener.md](groups/lan-listener.md)

### 05 Shell listener and computer list (`shell`)

The Shell gets an Upload and link toggle and a Host Control screen where Cross forgets a linked computer. Home focus starts on Host Control when no packages are installed, so a first Cross does not stop the listener.

Depends on:
- 04 LAN Listener serves uploads, links (`lan-listener`)

[groups/shell.md](groups/shell.md)

### 06 Link harness and build wiring (`native-tests`)

The link harness replays the fixtures through the parser, the store and a loopback listener. CMake registers it and the new native sources.

Depends on:
- 03 Link store and getter (`link-store`)
- 04 LAN Listener serves uploads, links (`lan-listener`)

[groups/native-tests.md](groups/native-tests.md)

### 07 SDK client calls computers (`sdk-client`)

`createHostClient` posts each command to a computer's `/command` and resolves every failure as a coded `HostResult`. `linkedHosts` reads the Shell's links on each call.

Attention (tradeoff):
A command still running at 5 s resolves `timeout`, but the Vita's `fetch` has no abort, so the computer may still run it. The client never retries, so a caller cannot tell whether the command ran.

Depends on:
- 01 Wire contract and plugin registry (`contract`)

[groups/sdk-client.md](groups/sdk-client.md)

### 08 Companion answers linked peers (`companion-server`)

`startHostCompanion` serves `POST /command`, checks the peer before reading the body, as [a Codex review](source:s2) asked, and routes to a loaded plugin.

Attention (risk):
Until a Vita links, `isAllowed` returns true for every peer, and `start` listens on `0.0.0.0`. Any LAN peer can then call every loaded command, including installed plugins, which run with the user's permissions. Once a link exists, only that Vita's address, loopback and this computer's own addresses get answers.

Questions:
- Why does `isAllowed` admit every peer until a Vita links, instead of refusing?

Depends on:
- 01 Wire contract and plugin registry (`contract`)

[groups/companion-server.md](groups/companion-server.md)

### 09 Companion CLI and link (`companion-cli`)

`link` posts this companion's id and URL to a Vita's `/link`, and `start` relinks each linked Vita, retrying an offline one every 30 s.

Depends on:
- 08 Companion answers linked peers (`companion-server`)

[groups/companion-cli.md](groups/companion-cli.md)

### 10 Build a custom plugin package (`plugin-build`)

`vitadeck build` writes `<slug>.vdplugin` from `hostPlugin`, bundling the implementation and copying `files/`, and swaps it in only after the build succeeds. A plugin-only project rebuilds in `dev` without an upload URL.

Depends on:
- 01 Wire contract and plugin registry (`contract`)

[groups/plugin-build.md](groups/plugin-build.md)

### 11 Scaffolds for host plugins (`scaffold-templates`)

`create --host-plugin` overlays the plugin template onto a Deck App, and `create --host-plugin-only` makes a plugin project whose `package.json` exports its registry.

Attention (product):
`copy-templates` maps `workspace:*` dependencies to published versions, so a new project gets `@vitadeck/host-companion` at `^0.1.0`. The companion is `private` and unpublished, so the project's `npm install` cannot resolve it until a release publishes it.

Depends on:
- 10 Build a custom plugin package (`plugin-build`)

[groups/scaffold-templates.md](groups/scaffold-templates.md)

### 12 Companion loads and installs packages (`plugin-install`)

`start` loads each installed package by file URL and reloads it on change; `install` stages an archive, then renames it into `plugins/`.

Attention (contract):
A package loads when `manifest.json` has `schemaVersion` 1 and its default export has an `id` and a `Map` of commands. The loader checks that shape rather than the SDK's classes, so a companion built from another SDK version still loads the package and matches `HostCommandError` by name and code.

Depends on:
- 09 Companion CLI and link (`companion-cli`)
- 08 Companion answers linked peers (`companion-server`)

[groups/plugin-install.md](groups/plugin-install.md)

### 13 Companion build and test wiring (`companion-packaging`)

`pnpm build` bundles the companion into one `cli.mjs` with no runtime dependencies, and the `fast` tier runs its tests.

[groups/companion-packaging.md](groups/companion-packaging.md)

### 14 Event log and held wait (`event-log`)

`core.events` answers at once with newer events, or holds the request for the plugin's next event for up to 25 s.

Attention (tradeoff):
The log keeps 100 events per plugin and drops the oldest. A wait returns only what is kept while `next` still moves on, so a Deck App more than 100 events behind gets no sign of the gap.

[groups/event-log.md](groups/event-log.md)

### 15 Deck App watches events (`event-watch`)

`watchHostEvents` keeps one `core.events` wait open and passes each batch's `next` as `after`.

Attention (contract):
A throw from `onEvent` rejects the `wait` that `void wait()` starts, and nothing catches that rejection, so the Deck App fails. The doc comment on `watchHostEvents` says a throw fails the Deck App.

Depends on:
- 14 Event log and held wait (`event-log`)

[groups/event-watch.md](groups/event-watch.md)

### 16 Stop cancels pending fetches (`native-fetch-cancel`)

Stopping a Deck App cancels its pending fetches at curl's next progress call, so a held event wait does not hold up the stop.

[groups/native-fetch-cancel.md](groups/native-fetch-cancel.md)

### 17 Host Control demo Deck App (`demo`)

A Deck App lists linked computers with live CPU, then shows the selected one's capabilities, gauges, an Echo round trip and notices.

[groups/demo.md](groups/demo.md)

### 18 ADR, READMEs and agent skills (`docs`)

ADR 0004, `CONTEXT.md`, the READMEs and the agent skills describe the link-once design, plugin packages and the LAN Listener.

[groups/docs.md](groups/docs.md)