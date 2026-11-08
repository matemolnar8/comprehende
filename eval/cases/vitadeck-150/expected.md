# vitadeck-150: Stop agents rediscovering how to drive the host window, and fix four repo traps

PR #150. No ticket, no comments. One retro motivates the PR, but the fixes are independent: a GUI drive script, a Docker smoke ownership fix, a shared demo section count, a Pages republish fix, a single stb_ds implementation unit, and docs moves.

## Story

- Title: the PR title, or a close paraphrase.
- Why: present. The PR body says a retro of 10 agent sessions found the time goes on stale or missing know-how.
- Size: small to large. Most of the diff is docs and small script fixes; the new 160-line drive script adds the most.
- Parts: about 5. Each fix could have been its own PR. The retro is one motive, not one story.
- Groups: about 6.

## Groups

1. Host window driving: `scripts/gui-drive.sh` and `.agents/skills/vitadeck-manual-testing/SKILL.md`.
2. Docker smoke hands back JS output: `scripts/smoke-docker.sh`.
3. One demo section count: `tests/demo_sections.h`, the `DEMO_SECTION_COUNT` hunks of `tests/deck_app_input_harness.c` and `tests/smoke_harness.c`, and the comment in `js/examples/demo/src/App.tsx`.
4. Pages republish keeps `evidence/`: `.agents/skills/pages/scripts/pages-review.ts`, `.agents/skills/pages/SKILL.md`.
5. stb_ds compiles once: `src/core/stb_ds.c`, `CMakeLists.txt`, `src/main.c`, and the removed `STB_DS_IMPLEMENTATION` lines in the harnesses.
6. Agent docs: `AGENTS.md`, `CODING_STANDARDS.md`, `docs/releasing.md`, and the build, emulator, and smoke skills.

## Must

- `tests/demo_sections.h` defines `DEMO_SECTION_COUNT`; `deck_app_input_harness.c` sets `ROUNDS` from it, and `smoke_harness.c` static-asserts that `PAGES` has one entry per demo section.
- `src/core/stb_ds.c` now holds the only `STB_DS_IMPLEMENTATION`, compiled in `vitadeck_core`; `main.c` and the harnesses drop their own copy.
- `scripts/smoke-docker.sh` now hands back `js/packages/*/dist` and `js/examples/*/.vitadeck` from an EXIT trap, so it also runs when a step fails.
- The fixes are separate parts with their own `parts[]` entries; the shared retro does not make them one story.

## Good

- The review rules move from `AGENTS.md` into `CODING_STANDARDS.md`, and `AGENTS.md` keeps a pointer.

## Must not

- Do not put the whole PR in one part because one retro motivates it.
- Do not put the stb_ds change in the demo section count group, although both touch the same harness files.

## Notes

- This case checks that independent fixes under one motive become separate parts. `tests/deck_app_input_harness.c` and `tests/smoke_harness.c` hold hunks of two stories, so they have no expect.
