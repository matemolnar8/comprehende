# vitadeck-144: Let Deck Apps call linked computers through plugins

PR #144, closes #109, #110, #111 and includes #145. A 110-file feature in C, TypeScript, and docs, with a long PR body. This case measures what a review misses when it describes changed files it did not read.

## Story

- Title: the PR title, or its goal in plain words.
- Why: present. The PR body says "A Deck App had no way to reach the computer next to it."
- Size: very-large. Large is also fine: 110 files and about 7,400 changed lines, with 643 of them a deleted server that moved.
- Parts: zero to eight. One story is fine, and so are parts for the SDK, the companion, the listener, and the plugin tooling.
- Groups: about 12 to 20. The range in `case.json` is wide because past runs gave 7 to 26, all defensible on a change this size.

## Groups

1. SDK wire contract and client: `js/packages/sdk/src/host-control/`, `js/packages/sdk/test/host-control.test.ts`, `tests/fixtures/host-control/`.
2. Host Companion: `js/packages/host-companion/`.
3. LAN Listener, which replaces the upload server: `src/net/`, `src/upload/`, `src/platform/lan_address*`, `tests/upload_*`.
4. Link store and JS getter: `src/host_control/`, `src/jslib/host_control.c`, `tests/host_control_link_harness.c`, with `src/core/json.*` and `src/core/util.*`, which it needs.
5. Shell: `src/shell/`, `tests/shell_input_harness.c`, `src/main.c`, `src/core/bootstrap.c`.
6. Native fetch cancel: `src/jslib/fetch.c`, `tests/js_limits_harness.c`.
7. SDK CLI plugin build and scaffolds: `js/packages/sdk/cli/`.
8. Demo, docs, and tooling: `js/examples/host-control/`, `docs/`, `CONTEXT.md`, `.agents/skills/`, `scripts/agent-check.sh`.

## Must

- Turning off **Upload and link** lasts only until the next launch, because `toggle_listener` stores nothing and `main.c` calls `shell_start_listener` on every start.
- `lan_listener_start` reads the address once and `lan_address_detect` falls back to `127.0.0.1`, so the Shell can show a loopback address until the listener restarts.
- A failed Deck App Storage replace now says `Could not write Deck App Storage.`, and the old `Could not replace Deck App Storage.` text is gone, because `deck_app_storage.c` now calls `vd_replace_file`.
- `vd_replace_file` and `vd_read_replaced_file` in `src/core/util.c` are the temp and backup file replace moved from `deck_app_storage.c`, and the link store in `link.c` now uses them too.
- `withPublishedVersions` in `copy-templates.ts` rewrites workspace versions in every template `package.json`, not only the scaffold's.
- Cross on the Host Control screen forgets the focused computer at once, with no confirm step.

## Good

- `bootstrap.c` fails boot with `Could not initialize Host Control Links.` when `host_control_links_init` returns false.
- `linkVita` first asks the running companion for `capabilities` on loopback and refuses when none answers.
- The lines removed from `package_manifest.c` are `skip_json_value`, moved to `json.c` as `json_skip_value` with the same body.
- `createEventLog` drops the oldest event past 100 per plugin, and `wait` returns no sign of the gap, so a slow watcher loses events with no signal.
- `cpuPercent` keeps one module-level `previous` sample, so two Vitas each read the CPU share since the other's read.
- `config.vitas` stores the Vita's IP from `route`, and `isAllowed` compares the peer to that list, so a linked Vita that gets a new address receives 403.
- `lan_address_detect` on POSIX takes the first IPv4 interface that does not start with `127.`, so a host with a VPN or container network can show the wrong address.
- A document `lookFor` bullet says the PR body claims only read-only built-ins exist, while `core.notify` emits an event that any Deck App can watch.

## Must not

- Do not write a file note that says a file or hunk was not fetched, not read, or unverified, or that gives only a line count such as "Adds 71 lines".
- Do not say `util.c` adds string or parsing helpers, or that `deck_app_storage.c` drops parsing helpers; the moved code replaces files.
- Do not say `bootstrap.c` starts the listener or that `main.c` starts the link store; `bootstrap.c` calls `host_control_links_init`, and `main.c` calls `shell_start_listener`.
- Do not say that turning off **Upload and link** persists across launches.
- Do not describe the removal in `package_manifest.c` as a change in manifest parsing; the helper moved with no change in behavior.
- Do not repeat the PR claim that only read-only built-ins exist as a fact; `core.notify` is a built-in that emits an event.

## Notes

- Why this case exists: the skill used to allow eight fetches on a change past six files. Seven reviews written under that cap (Haiku medium and high, Sonnet low and high, Opus low and high, Grok low, skill 0.13.2) stated each `Must` at most three times, and most once or never. A file with no fetch got a note like "Host implementation." or "One added line; hunk not fetched."
- Blind grades with this list, one run each: Opus 5.5 high went from `must` 2/6 to 6/6 after the cap was removed, and Haiku 5.5 high from 1/6 to 3/6. The `Must` items came from what capped runs missed, so read the gain together with the false claims a grader finds, which this list did not choose.
- The eval grader on Opus 5.5 high, one run each: `must` 2/6 under the cap and 5/6 after it. A `sources FAIL` on these runs only means the review cited a source that is not frozen here, because they fetched sources live.
- Muse Spark 1.3 Contributor, two trials each with the eval grader: `must` stayed at 1/6 or 2/6 after the cap went, while false bullets fell from 14 of 242 to 4 of 243 and files read rose from 8 to all 109. Its file notes average under seven words, so facts it read stay out of the review. A case line near 2/6 on this model does not mean the producer read too little.
- Each `Must not` about a file note comes from one of those reviews. Sonnet low swapped `main.c` and `bootstrap.c`. Grok low called the file replace helpers string and parsing helpers. Opus high wrote 21 notes that said "not fetched".
- Each `Must` sits in a file that no PR text describes and whose digest line gives only symbols or a line count. A review states it only when it read the hunk. The PR body and `#109` to `#111` state the other design facts, which is why those are not here.
- The `Good` list holds facts that need a second file or a trace across files, per `eval/review-criteria.md`.
- `Must` and `Must not` scores do not change the exit code. Read the case line, for example `must 1/6  mustNot 2/6`, and compare it with a run of the older skill.
- `together` holds file pairs that every past run kept in one group. `apart` holds layers that every past run split. There is no `mechanicalPaths` expect, because past runs did not agree on where the lockfile goes.
