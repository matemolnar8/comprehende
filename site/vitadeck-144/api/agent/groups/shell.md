Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a447e3b960dc1c5434b9fbc2f45c112b1c630b1f` and `git rev-parse --verify ae5083caa9370b5f5985de1de0aa147a1afecc2e` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ae5083caa9370b5f5985de1de0aa147a1afecc2e -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 07 of 14: Shell toggle and Host Control screen (`shell`)

Part: Host Control

The why:

[#111](source:s-111) asks for a Host Control screen that lists links. An always-on listener also needs an off switch, and [an empty Shell must not put the first Cross on it](source:k-empty-shell).

The what:

Home gains **Upload and link** and **Host Control** rows after the packages, and `home_first_row` and `keep_entry_focus` [hold focus on the right row](source:k-keep-focus) as packages arrive.

Questions:
- Why does `toggle_listener` keep Off only in memory, so the next launch starts listening again?

Depends on:
- 05 One always-on LAN Listener replaces the upload server (`lan-listener`)
- 04 Native link store and getter (`link-store`)

Hunk refs for this concern:
- src/shell/shell.c
- src/shell/shell.h
- tests/shell_input_harness.c