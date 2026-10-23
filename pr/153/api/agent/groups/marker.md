Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify 511489f774dfeab593a53dc40d0905e0a06d0ad2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 511489f774dfeab593a53dc40d0905e0a06d0ad2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               511489f774dfeab593a53dc40d0905e0a06d0ad2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 511489f774dfeab593a53dc40d0905e0a06d0ad2

Review concern 01 of 03: readDiff flags generated files (`marker`)

Part: generated marker

The why:

A path pattern missed files that say they are generated in a header comment ([PR #153](source:s1)).

The what:

`generatedPaths` in `generated.ts` runs one `git grep` at head over the changed files, `markGenerated` in `diff.ts` sets the new `generated` field on each `DiffFile` whose first 20 lines hold a marker, and the git-call tally in `commands.test.ts` counts that one extra call.

Look for:
- Subtle: `generated.ts` flags itself. Its regex line holds `@generated` inside the first 20 lines, so this PR's own digest lists the file as generated.
- Every `readDiff` call now spawns one more git process, `git grep` at head over every non-deleted text file, including the server's live reads. `allowFail` swallows the exit 1 of no match, and any other grep failure with it; the file set is then empty and every file stays unflagged.
- A marker past line 20 does not count: `late.ts` in the test has the marker after 30 license lines and stays unflagged.

Hunk refs for this concern:
- src/git/generated.ts
- src/git/generated.test.ts
- src/git/diff.ts
- src/schema/types.ts
- src/cli/commands.test.ts