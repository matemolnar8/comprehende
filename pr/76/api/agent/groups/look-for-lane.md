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

Review concern 02 of 04: Look for lane (`look-for-lane`)

The why:

Overview is the place to scan every claim. A group page keeps that group's claims next to the diff.

The what:

`LookForList` renders the claims. Overview passes every claim with an owner jump. GroupBrief passes only that group's claims.

Look for:
- The focused row sets aria-current to location. It does not set aria-checked.
- A group with no lookFor bullets renders nothing for that list, including README wording in a review that has other claims.

Depends on:
- 01 Claim list without a grade (`claim-model`)

Hunk refs for this concern:
- src/ui/components/LookForList.tsx @@ -1,18 +1,89 @@
- src/ui/components/Overview.tsx @@ -4,6 +4,7 @@
- src/ui/components/Overview.tsx @@ -16,8 +17,10 @@
- src/ui/components/Overview.tsx @@ -46,8 +49,13 @@
- src/ui/components/GroupBrief.tsx @@ -7,6 +7,7 @@
- src/ui/components/GroupBrief.tsx @@ -44,10 +45,18 @@
- src/ui/components/GroupBrief.tsx @@ -81,7 +90,7 @@
- src/ui/components/Group.tsx @@ -32,6 +32,7 @@
- src/ui/components/Group.tsx @@ -98,6 +99,7 @@
- src/ui/components/ReviewStage.tsx @@ -8,6 +8,7 @@
- src/ui/components/ReviewStage.tsx @@ -39,6 +40,8 @@
- src/ui/components/ReviewStage.tsx @@ -58,7 +61,13 @@
- src/ui/components/ReviewStage.tsx @@ -88,6 +97,7 @@