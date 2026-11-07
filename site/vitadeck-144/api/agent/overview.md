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
- pr PR #144 Describes the design, deviations, proof and review ledger.
  https://github.com/matemolnar8/vitadeck/pull/144
- ticket #109
  https://github.com/matemolnar8/vitadeck/issues/109
- ticket #110
  https://github.com/matemolnar8/vitadeck/issues/110
- ticket #111
  https://github.com/matemolnar8/vitadeck/issues/111
- pr PR #145 The plugin UX follow-up this PR includes.
  https://github.com/matemolnar8/vitadeck/issues/145
- pr-comment chatgpt-codex-connector on PR #144
  https://github.com/matemolnar8/vitadeck/pull/144#discussion_r4406953125
- pr-comment cursor on PR #144

The title:

feat(host-control): let Deck Apps call linked computers through built-in and custom plugins

The why:

[PR #144](source:s1) says a Deck App had no way to reach the computer next to it.

The what (very large):

Deck Apps call typed commands on linked computers through a new SDK client, companion CLI and always-on LAN Listener; custom plugins ship as packages and push events.

Things to check:
- [#111](source:s4) asks for a separate link listener on 8798 that runs only while the Host Control screen is open. `lan_listener.c` serves `/link` and `/upload` together from boot instead; [PR #144](source:s1) says the first setup felt clunky.
- [#111](source:s4) names `nativeGetHostControlUrl` and one link in `host-control-link.json`. At head `nativeGetHostControlLinks` returns an array from `host-control-links.json`, and the payload gains `id`; [PR #144](source:s1) lists this deviation.
- [#109](source:s2) keeps command definitions internal because VitaDeck owns the companion, and offers a default `host`. At head `defineHostPlugin` is public and `createHostClient` takes a plugin; [PR #144](source:s1) lists plugins as a deviation.
- [#110](source:s3) allows no computer-acting commands before the credential decision, and gates later ones behind `enable`. At head a custom plugin command runs any code, and `server.ts` consults no `enable` list. No source says why custom plugins are exempt.
- [PR #144](source:s1) says only read-only built-ins exist. `core.notify` is a built-in that `server.ts` runs for any allowed peer, and its notice reaches every Deck App watching `core`.
- [#110](source:s3) runs the companion from source with `tsx` and saves one `vita`. At head it is a rolldown bundle with a `vitadeck-host-companion` bin, and `cli.ts` reads `vitas`. The deviation list in [PR #144](source:s1) names neither.
- [PR #144](source:s1) says the LAN Listener uses port 8787. `lan_listener_start` tries 8787 through 8796, and `link` assumes 8787 when the address names no port, so a Vita that fell forward needs the port the Shell shows.
- [Cursor's review](source:s7) says human review is needed, no reviewers were assigned, and Bugbot and the security check did not run. The review table in [PR #144](source:s1) lists only Claude, Grok and Muse, and no source shows a human review.

## Review concerns

### 01 Wire contract and plugin registries (`contract`)

`protocol.ts` and `plugin.ts` define what the client, the companion and the C harness share, and the fixtures pin it.

[groups/contract.md](groups/contract.md)

### 02 SDK client (`sdk-client`)

`createHostClient` and `linkedHosts` read VitaDeck's links on each call, and every failure resolves to a `HostResult`.

Attention (contract):
`createHostClient(plugin)` without `hostId` calls `hosts[0]`, read on every call. With laptop A linked, a `link` from desktop B sends the next call to B, so a Deck App's later command reaches another machine with no error. Decide whether the default should follow the newest link or stay on one host.

Depends on:
- 01 Wire contract and plugin registries (`contract`)

[groups/sdk-client.md](groups/sdk-client.md)

### 03 Shared native helpers (`native-helpers`)

`core/json` and `core/util` gain helpers the link store and listener include, while `deck_app_storage.c` and `package_manifest.c` shrink.

[groups/native-helpers.md](groups/native-helpers.md)

### 04 Link store and getter (`link-store`)

`link.c` parses links and saves them in `host-control-links.json`, and `nativeGetHostControlLinks` hands them to JS as JSON.

Attention (product):
`host_control_links_save` keeps four links and drops the oldest with no message. A fifth computer's `link` succeeds, and the dropped computer's next `start` gets 404 `unknown_link`, so [its companion drops that Vita](source:s1). Decide whether a full list should evict or refuse.

Depends on:
- 01 Wire contract and plugin registries (`contract`)
- 03 Shared native helpers (`native-helpers`)

[groups/link-store.md](groups/link-store.md)

### 05 LAN Listener replaces upload server (`lan-listener`)

`lan_listener.c` replaces the upload server with one listener for `/upload` and `/link`, and `net/http.c` takes the request parsing.

Attention (risk):
`handler_thread` routes `POST /upload` and `POST /link` with no peer or credential check, from boot. A LAN peer can publish a Deck App, or post a link with an `id` it chooses; `host_control_links_save` puts that link first, and four such posts push out every real link. [PR #144](source:s1) accepts this until credentials exist. Decide whether on-by-default is right.

Depends on:
- 03 Shared native helpers (`native-helpers`)
- 04 Link store and getter (`link-store`)

[groups/lan-listener.md](groups/lan-listener.md)

### 06 Shell rows and Host Control screen (`shell`)

The Shell gains **Upload and link** and **Host Control** rows, plus a screen that lists links and forgets them with no confirm step.

Attention (product):
`toggle_listener` stops the listener and stores nothing, and `shell_start_listener` starts it unconditionally. A user who turns **Upload and link** off on a shared network gets it back on at the next launch. Decide whether off should persist, since this listener takes unauthenticated uploads.

Depends on:
- 04 Link store and getter (`link-store`)
- 05 LAN Listener replaces upload server (`lan-listener`)

[groups/shell.md](groups/shell.md)

### 07 Native link harness (`native-harness`)

`host_control_link_harness` replays the link fixtures in C, and CMake and `agent-check.sh` run it with the JS checks.

Depends on:
- 04 Link store and getter (`link-store`)
- 05 LAN Listener replaces upload server (`lan-listener`)

[groups/native-harness.md](groups/native-harness.md)

### 08 Companion server and built-ins (`companion-server`)

`startHostCompanion` checks the peer, then the route and payload, then runs the command, as [Codex asked](source:s6). `core.ts` and `system-stats.ts` implement the built-ins.

Attention (risk):
`isAllowed` answers every peer while `vitas()` is empty. Forgetting the only link in the Shell [empties `vitas` on the next `start`](source:s1), so a companion on `0.0.0.0` then serves any LAN peer, installed plugins included. [#110](source:s3) asks for the peer check only once linked. Decide whether an emptied list should reopen the companion.

Depends on:
- 01 Wire contract and plugin registries (`contract`)

[groups/companion-server.md](groups/companion-server.md)

### 09 Companion link and relink (`companion-link`)

`linkVita` posts this companion's URL to a Vita, and every `start` relinks saved `vitas` one at a time, retrying every 30 s.

Questions:
- Why does `relink` omit the `--advertise` value that `link` passes to `linkVita`?

Depends on:
- 08 Companion server and built-ins (`companion-server`)

[groups/companion-link.md](groups/companion-link.md)

### 10 Companion package setup (`companion-package`)

The companion becomes a private workspace package bundled by rolldown, and `js/package.json` wires it into the root scripts.

[groups/companion-package.md](groups/companion-package.md)

### 11 Host Control demo app (`demo`)

`js/examples/host-control` lists every linked computer with live CPU, and shows the selected one's capabilities, gauges and an Echo round trip.

Depends on:
- 02 SDK client (`sdk-client`)
- 08 Companion server and built-ins (`companion-server`)

[groups/demo.md](groups/demo.md)

### 12 Plugin package build (`plugin-build`)

`build` writes a Deck App, a `.vdplugin` package and their zips, or only the plugin when `entry` is absent. A plugin-only `dev` rejects a URL and uploads nothing.

Attention (tradeoff):
`build` runs the Deck App and plugin builds in one call, and `buildDeckApp` deletes the old `.vdapp.zip` first. When the plugin fails, `build` throws before any archive is written, so `dev` uploads nothing that cycle and `dist` has no `.vdapp.zip`, while the last good `.vdplugin` survives. Decide whether one failure should block both.

[groups/plugin-build.md](groups/plugin-build.md)

### 13 Plugin scaffolds (`plugin-scaffold`)

`create --host-plugin` overlays `host/` on the Deck App scaffold, and `--host-plugin-only` makes a project with no `entry` that exports its registry.

Depends on:
- 12 Plugin package build (`plugin-build`)

[groups/plugin-scaffold.md](groups/plugin-scaffold.md)

### 14 Plugin install and reload (`plugin-install`)

`install` stages and loads a package before renaming it into the plugins folder, and `start` reloads plugins when watched folders change.

Attention (risk):
`install` calls `loadHostPluginPackage` on the staged package, so its code runs with the user's permissions before any command and before the built-in id check. Once loaded, `server.ts` lets any Deck App on a linked Vita call any plugin, because the peer check knows only the IP. Decide whether that is enough before credentials exist.

Depends on:
- 12 Plugin package build (`plugin-build`)

[groups/plugin-install.md](groups/plugin-install.md)

### 15 Events by long-polling (`events`)

`core.events` holds a request until the plugin's next event, and `watchHostEvents` keeps one wait open, passing `next` as `after`.

Attention (tradeoff):
`watchHostEvents` keeps one native fetch open per watch, and `fetch.c` runs each fetch on its own thread. A computer that stops answering costs 29 s to time out and 30 s more to retry. [PR #144](source:s1) rejects WebSocket and SSE in ADR 0004. Decide whether a held thread per watch suits the Vita.

Questions:
- Why does `watchHostEvents` keep its `after` cursor when the resolved host changes?

[groups/events.md](groups/events.md)

### 16 Fetch cancels on Deck App stop (`fetch-cancel`)

`fetch_shutdown` marks every pending fetch cancelled and `fetch_progress_cb` aborts it, so a held wait no longer delays a stop.

Attention (contract):
`fetch_shutdown` cancels every pending fetch, not only event waits. A Deck App that posts a save and then stops used to block the stop until the request ended; at head the transfer aborts at curl's next progress call, about a second later, and the save may not arrive. Decide whether all fetches should share this.

Depends on:
- 15 Events by long-polling (`events`)

[groups/fetch-cancel.md](groups/fetch-cancel.md)

### 17 ADR, glossary and READMEs (`docs`)

ADR 0004, `CONTEXT.md`, `AGENTS.md` and the READMEs are rewritten in place for plugins, the LAN Listener and relink, with no code here.

[groups/docs.md](groups/docs.md)

### 18 Agent skills (`skills`)

A new `vitadeck-host-control` skill and edits to five others teach agents the companion, plugins and the always-on listener.

[groups/skills.md](groups/skills.md)