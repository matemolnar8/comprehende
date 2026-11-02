Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c1093ea2d07e3b2e5660edd75776ef686d8aa12b` and `git rev-parse --verify 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames c1093ea2d07e3b2e5660edd75776ef686d8aa12b 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  c1093ea2d07e3b2e5660edd75776ef686d8aa12b

head               4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c1093ea2d07e3b2e5660edd75776ef686d8aa12b 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82

Review concern 02 of 02: Eval producer matches CI and keeps its session (`harness`)

The why:

[Local runs loaded personal agent rules that CI does not have](source:s2), and a failing run needs its session id to be exported and debriefed.

The what:

`runMuseCodeAgent` passes `--no-foreign-personal-context` to `muse exec` and returns the parsed `sessionId` on a finished run.

Hunk refs for this concern:
- scripts/eval/musecode.ts