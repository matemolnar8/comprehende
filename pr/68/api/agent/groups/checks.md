Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 61f79cce8191e348bcd1d72ade335b4c47c18ad9` and `git rev-parse --verify 603bbf138873e1fab673ef73d0a8238cc225190a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  61f79cce8191e348bcd1d72ade335b4c47c18ad9

head               603bbf138873e1fab673ef73d0a8238cc225190a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a

Review concern 04 of 08: Deterministic checks (`checks`)

Part: Report grader

The why:

The [design](source:s3) makes `expect` the pass/fail work. Graders only emit findings.

The what:

Checks flag a dirty worktree, invented source URLs, why/parts/size, together/apart, and long or dashed prose. `gradingPacket` is the live hunks those graders read.

Look for:
- A GitHub commit URL whose SHA is in `base...head` counts as in-range, not invented. Transcript sources always fail.

Depends on:
- 01 Case schema and flags (`schema`)
- 03 Isolated producer (`producer`)

Hunk refs for this concern:
- scripts/eval/checks.ts @@ -0,0 +1,276 @@
- scripts/eval/packet.ts @@ -0,0 +1,93 @@