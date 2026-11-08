# vitadeck-81: Report unhandled rejections, stop stb_ds seed race, log dropped events

PR #81, fixes issues #69 and #78. Two comments. Two independent runtime fixes, each with its own issue, plus a small log line for dropped input events.

## Story

- Title: the PR title.
- Why: present. Issue #69 asks to report unhandled promise rejections, and issue #78 reports a TSan race on `stbds_hash_seed`.
- Size: small or medium.
- Parts: two or three. The rejection tracker and the seed race fix each close their own issue. The dropped-event log can be a third part.
- Groups: 2 to 4.

## Groups

1. Unhandled rejections: `src/core/js_runtime.c`, `src/jslib/error.c`, `src/jslib/jslib.h`, `tests/js_limits_harness.c`, `CONTEXT.md`.
2. stb_ds seed race: `vendor/stb_ds.h`.
3. Dropped-event log: `src/core/event_queue.c`, `tests/event_queue_harness.c`, `CMakeLists.txt`. Can be its own part.

## Must

- `js_runtime.c` installs a QuickJS promise rejection tracker; a rejection that still has no handler after the microtask queue drains is reported as an uncaught error and shows the Deck App Failure Screen.
- The vendored `stb_ds.h` no longer advances the global `stbds_hash_seed` when it creates a hash map; it only reads it, and the hunk is marked `VitaDeck:`.
- `event_queue_push` now logs a warning when it drops an event on a full queue, and `CMakeLists.txt` links raylib into `event_queue_harness` for that `TraceLog` call.
- The rejection fix and the seed race fix are separate parts, each with its own `parts[]` entry.

## Good

- `js_limits_harness` adds a case where a `catch` attaches in a later microtask, and that case must not fail the app.

## Must not

- Do not put the `stb_ds.h` change in the same part as the rejection tracker.
- Do not add a `dependsOn` between the rejection and seed race groups.

## Notes

- This case checks that two fixes that close two issues become two parts.
