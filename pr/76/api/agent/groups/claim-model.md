Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify 61a6692eb1dba82b5e0c31c2aad6552c2341e5bc` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 61a6692eb1dba82b5e0c31c2aad6552c2341e5bc -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               61a6692eb1dba82b5e0c31c2aad6552c2341e5bc

Named refs at pin: origin/main ... origin/cursor/lookfor-triage-lanes-e92c

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 61a6692eb1dba82b5e0c31c2aad6552c2341e5bc

Review concern 01 of 04: Claim list without a grade (`claim-model`)

The why:

[#71](source:s1) needs a list of claims to scan. The list is not a checkbox grade.

The what:

`lookForClaims` walks document then group bullets, parses risk tags, and keeps citation ids.

Look for:
- LookForClaim has key, owner, tag, text, body, and sourceIds. It has no passed, failed, or checked field.

Hunk refs for this concern:
- src/ui/lib/look-for.ts @@ -0,0 +1,122 @@
- src/ui/lib/look-for.test.ts @@ -0,0 +1,202 @@