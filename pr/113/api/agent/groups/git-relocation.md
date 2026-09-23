Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4b954d780efe076b16352c2916c6ec402f9ca743` and `git rev-parse --verify 955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 4b954d780efe076b16352c2916c6ec402f9ca743 955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  4b954d780efe076b16352c2916c6ec402f9ca743

head               955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 4b954d780efe076b16352c2916c6ec402f9ca743 955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae

Review concern 01 of 02: Git names the move (`git-relocation`)

Part: relocation

The why:

[#110](source:s1) asks the review to use git's own rename and copy detection.

The what:

The live diff stores the similarity score, a header for a pure path change, and the lines git marks as moved.

Hunk refs for this concern:
- src/api/live.ts
- src/api/types.ts
- src/git/diff.test.ts
- src/git/diff.ts
- src/git/moved.test.ts
- src/git/moved.ts
- src/git/name-status.test.ts
- src/git/name-status.ts
- src/schema/types.ts
- src/test/covering-document.ts
- src/test/example-repo.ts
- scripts/fixture-smoke.ts