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
- pr PR #144 Adds Host Control end to end, then plugins, standalone plugins, events, an always-on LAN Listener and relink. Lists its deviations from the issues.
  https://github.com/matemolnar8/vitadeck/pull/144
- ticket #109 JSON wire contract, typed registry, a client that never rejects, shared fixtures.
  https://github.com/matemolnar8/vitadeck/issues/109
- ticket #110 `start` and `link`, a port that never falls forward, a peer check once linked, no computer-acting commands.
  https://github.com/matemolnar8/vitadeck/issues/110
- ticket #111 A link listener that runs only on the Host Control screen, a persisted link store, shared HTTP parsing, a no-confirm forget.
  https://github.com/matemolnar8/vitadeck/issues/111
- pr PR #145 Built-in plugins first, a `.vdplugin` package for a Deck App's own plugin, and two CLIs, one per machine role. Merged into this branch.
  https://github.com/matemolnar8/vitadeck/pull/145
- pr-comment chatgpt-codex-connector on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406953125
- pr-comment matemolnar8 on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406956973
- pr-comment cursor on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#pullrequestreview-5721580682
- pr-comment cursor on PR #144 (Bugbot)
  https://github.com/matemolnar8/vitadeck/pull/144#issuecomment-6539910273
- commit fix(shell): an empty Shell focuses Host Control so Cross keeps listening
- commit fix(shell): an install keeps Home focus on the entry row it was on
- commit fix(host-companion): relink attempts run one at a time and re-read the config
- commit fix(host-control): a broken plugin build keeps the last good package
- commit fix(sdk): standalone plugins take the SDK as a peer dependency
- commit fix(host-companion): start plugin lifecycles after binding the port

The title:

Let Deck Apps call linked computers through built-in and custom plugins

The why:

[A Deck App had no way to reach the computer next to it.](source:s-pr)

The what (very large):

Adds Host Control: a typed SDK client and plugin contract, the `vitadeck-host-companion` CLI, and a native LAN Listener that replaces the upload server and stores links. Two more stories ship with it: long-polling host events with fetch cancel, and new agent skill text.

Things to check:
- [#111](source:s-111) asks for a separate link listener on port 8798 that runs only while the Host Control screen is open. Head has one always-on listener on 8787 for uploads and links. [The body](source:s-pr) gives the reason: setup felt clunky after testing.
- [#111](source:s-111) asks for `nativeGetHostControlUrl(): string` and one stored link. Head exposes `nativeGetHostControlLinks` and keeps several links in `host-control-links.json`. [The body](source:s-pr) lists this as a deviation.
- [#109](source:s-109) keeps `defineHostCommands` internal because the companion is VitaDeck-owned, and it sends no `plugin` field. Head lets authors define plugins with `defineHostPlugin`, and the wire request gains `plugin`. [The body](source:s-pr) and [#145](source:s-145) give the reason.
- [#110](source:s-110) has the companion run from source through tsx and store one `vita`. Head bundles it with a `vitadeck-host-companion` bin and stores a `vitas` list. [#145](source:s-145) says the pnpm-only CLI was clunky for users, and [the body](source:s-pr) lists several links as a deviation.
- [The body](source:s-pr) says credentials are deferred, "so only read-only built-ins exist". The same body lists `core.notify`, which sends a notice to every watching Deck App, and `server.ts` runs it for any allowed peer. It writes to the companion's event log and does not act on the computer.
- [The body](source:s-pr) says `watchHostEvents` means no events "fall between two waits". It also says the companion keeps only 100 events per plugin, and its ledger declines exact restart detection. A gap past 100 events, or a missed restart, cannot be replayed.
- [The body](source:s-pr) opens its review section with "Three review loops ran, one per request". Its table lists six: Host Control, Plugin UX, Standalone plugins, Events, LAN Listener and Relink.
- [The body's Cursor summary](source:s-pr) says "Reviewed by Cursor Bugbot for commit ae5083ca". All 17 of Cursor's conversation comments [say Bugbot could not run](source:c-bugbot) because of a usage limit. The summary is not evidence of a Bugbot review.
- [Cursor's approval agent](source:c-cursor) says human review is needed and no reviewers were assigned. All 19 GitHub reviews have the state COMMENTED: 17 from Cursor, one from Codex and one author reply. The PR records no GitHub approval, and the review table in the body lists only AI reviewers.

## Review concerns

### 01 Wire contract, plugin types and SDK client (`sdk-contract`)

`protocol.ts` and `plugin.ts` define what `client.ts` sends, and the fixtures in `tests/fixtures/host-control/` pin those bytes for the SDK, companion and C tests.

Attention (contract):
`createHostClient(plugin)` without `hostId` calls `linkedHosts()[0]`, read at each call. Link computer A, then B, and every default client moves to B on its next call, with no signal to the Deck App. A relink edits in place (`link.c:199`) and does not reorder, so decide whether "most recently linked" is a promise authors can rely on.

[groups/sdk-contract.md](groups/sdk-contract.md)

### 02 Companion command server, peer check and built-ins (`companion-server`)

`server.ts` answers an unlinked peer with [a 403 and discards its body unbuffered](source:c-mate), then checks the request and the plugin's payload guard before it runs a command from `core.ts` or `system-stats.ts`.

Attention (risk):
`isAllowed` returns true for every peer when `vitas` is empty. A companion that was never linked answers the whole LAN on `0.0.0.0`, and so does one whose last Vita was forgotten, because relink empties `vitas`. Installed plugins are then callable too, so decide whether an empty list should mean open or loopback-only.

Depends on:
- 01 Wire contract, plugin types and SDK client (`sdk-contract`)

[groups/companion-server.md](groups/companion-server.md)

### 03 Shared JSON and file-replace helpers (`native-foundation`)

`deck_app_storage.c` and `package_manifest.c` give up about 70 lines as `json.c` and `util.c` gain about 120, so the existing callers and `link.c` share one set of helpers.

[groups/native-foundation.md](groups/native-foundation.md)

### 04 Native link store and getter (`link-store`)

`link.c` parses and persists links in `host-control-links.json`, and `nativeGetHostControlLinks` in `src/jslib/host_control.c` hands the same list to JS as a JSON array.

Questions:
- Why does `host_control_links_save` silently evict the oldest link instead of refusing a new link when the store is full?

Depends on:
- 03 Shared JSON and file-replace helpers (`native-foundation`)

[groups/link-store.md](groups/link-store.md)

### 05 One always-on LAN Listener replaces the upload server (`lan-listener`)

`lan_listener.c` takes over the upload routes from the deleted `http_server.c` and adds `POST /link`, using request parsing moved to `net/http.c` and an address from `src/platform/lan_address_*`.

Attention (risk):
[The body](source:s-pr) accepts that anyone on the LAN can upload a Deck App or add a link whenever VitaDeck runs. `POST /link` with any valid `id` and `url` puts that link first, so a default `createHostClient` then sends its commands there. Turning the listener off lasts only until the next launch, so decide whether always-on without credentials is the right default on a shared network.

Depends on:
- 04 Native link store and getter (`link-store`)

[groups/lan-listener.md](groups/lan-listener.md)

### 06 Companion `link` and relink on start (`companion-link`)

`start` in `cli.ts` passes every saved Vita to `relink`, which calls `linkVita` from `link.ts` through one queue and retries every 30 s while a Vita does not answer.

Questions:
- Why does the relink loop target port 8787 when `lan_listener_start` can fall forward as far as 8796?

Depends on:
- 02 Companion command server, peer check and built-ins (`companion-server`)
- 05 One always-on LAN Listener replaces the upload server (`lan-listener`)

[groups/companion-link.md](groups/companion-link.md)

### 07 Shell toggle and Host Control screen (`shell`)

Home gains **Upload and link** and **Host Control** rows after the packages, and `home_first_row` and `keep_entry_focus` [hold focus on the right row](source:k-keep-focus) as packages arrive.

Questions:
- Why does `toggle_listener` keep Off only in memory, so the next launch starts listening again?

Depends on:
- 05 One always-on LAN Listener replaces the upload server (`lan-listener`)
- 04 Native link store and getter (`link-store`)

[groups/shell.md](groups/shell.md)

### 08 Companion loads, installs and hot-reloads `.vdplugin` packages (`plugin-loading`)

`install` in `cli.ts` stages a package with `extractHostPluginArchive`, proves it with `loadHostPluginPackage` and renames it into place, and `start` reloads it through `setPlugins` when files change.

Attention (risk):
A package runs with the user's permissions, and nothing limits what its commands do. [#145](source:s-145) holds back computer-acting built-ins for the credentials decision, yet an installed custom plugin can act on the computer for any allowed peer today. Decide whether the warning in the `install` usage text is enough until credentials exist.

Questions:
- Why does `install` import the package's entry to learn its plugin id, when the manifest could carry that id?

Depends on:
- 02 Companion command server, peer check and built-ins (`companion-server`)

[groups/plugin-loading.md](groups/plugin-loading.md)

### 09 SDK CLI builds and scaffolds host plugins (`sdk-plugin-build`)

`resolveHostPlugin` and `buildHostPlugin` in `cli.ts` turn `hostPlugin` in `vitadeck.config.json` into the `.vdplugin` package and zip the companion loads, and the templates scaffold that config.

Depends on:
- 01 Wire contract, plugin types and SDK client (`sdk-contract`)
- 08 Companion loads, installs and hot-reloads `.vdplugin` packages (`plugin-loading`)

[groups/sdk-plugin-build.md](groups/sdk-plugin-build.md)

### 10 Host Control demo Deck App (`demo`)

`App.tsx` reads `linkedHosts`, polls `systemStats` for each host and shows `HostDetails` for the selected one, with the other files making it a buildable example.

Depends on:
- 01 Wire contract, plugin types and SDK client (`sdk-contract`)

[groups/demo.md](groups/demo.md)

### 11 ADR, glossary and author docs (`docs`)

These files carry the design decisions and author-facing commands of the groups above; ADR 0004 is the one that records the always-on listener and the deferred credentials.

[groups/docs.md](groups/docs.md)

### 12 Host events by long-polling (`events`)

A plugin's `start(emit)` lifecycle feeds `events.ts`, `core.events` holds a request on that log for up to 25 s, and `watchHostEvents` keeps one such request open.

[groups/events.md](groups/events.md)

### 13 Native fetch cancels when a Deck App stops (`fetch-cancel`)

`fetch_shutdown` marks every pending request cancelled, and the new curl progress callback in `fetch.c` aborts each transfer, which `js_limits_harness` proves with a server that never answers.

Attention (contract):
This applies to every fetch of every Deck App, not only event waits. A Deck App that sends a `POST` and then stops used to wait in `fetch_shutdown` until the transfer finished. Now that transfer aborts at curl's next progress call and the request may not complete, so decide whether a reload may drop in-flight writes.

Depends on:
- 12 Host events by long-polling (`events`)

[groups/fetch-cancel.md](groups/fetch-cancel.md)

### 14 Agent skills for Host Control (`agent-skills`)

The new skill covers the companion, linking, plugin authoring and error codes, and the other skills gain short pointers to it and to the new build outputs.

[groups/agent-skills.md](groups/agent-skills.md)