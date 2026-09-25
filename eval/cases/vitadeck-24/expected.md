# vitadeck-24: Cancel JS timers on runtime shutdown

PR #24. No ticket, no comments.

## Story

- Title: the PR title.
- Why: present, from the PR. When the Deck App runtime restarts, pending timers must be cancelled before the QuickJS context is freed.
- Size: small.
- Parts: one story. Groups: 2.

## Groups

1. Timer shutdown: `src/jslib/timeout.c`, `src/jslib/jslib.h`, `src/core/js_runtime.c`.
2. Regression harness in CI: `tests/timer_reload_harness.c`, `CMakeLists.txt`, `.github/workflows/ci.yml`.

## Must state

- Timer ids now start at 1, and 0 is never returned, also after the counter wraps. The PR does not mention this. Before, the first timer had id 0.

## Good to state

- Before the fix, `timeout_hm` was a static that outlived the runtime. After a restart, `run_timeouts` could call a function from the freed context.

## Must not

- Do not add document `lookFor` bullets about manual QA or JS build steps that the diff does not touch. No source item differs from the diff, so document `lookFor` is empty.
- Do not give the one-line call in `js_runtime.c` its own group.
- Do not tag a race between `run_timeouts` and shutdown. Both run in sequence on the JS thread.

## Baseline

- 3 of 6 runs noted the id change, often as "confirm no code assumed id 0".
- Runs made 3 to 5 groups. Every run had document `lookFor` padding.

## case.json

- `parts` max 3 to 1, `size` to small.
- `together`: the three shutdown files, and the harness with `CMakeLists.txt`.
- Added the timer id claim.
