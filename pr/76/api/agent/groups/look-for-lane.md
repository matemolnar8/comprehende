Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify aece9b956fb88e22b77355743e7ca0eadffe645b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 aece9b956fb88e22b77355743e7ca0eadffe645b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               aece9b956fb88e22b77355743e7ca0eadffe645b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 aece9b956fb88e22b77355743e7ca0eadffe645b

Review concern 02 of 04: Look for lane (`look-for-lane`)

The why:

[#71](source:s1) wants a place to scan and jump. [The later feedback](source:s4) says Overview must not dump every claim.

The what:

`LookForIndex` on Overview is counts and owner jumps. `LookForList` on GroupBrief is the full sentences.

Look for:
- LookForIndex renders one row per owner. Group claim sentences stay off Overview until you open that group.
- The document bucket is a closed details. Opening it renders LookForList for those claims only.
- The focused row sets aria-current to location. It does not set aria-checked.

Depends on:
- 01 Claim list without a grade (`claim-model`)

Hunk refs for this concern:
- src/ui/components/Group.tsx @@ -32,6 +32,7 @@
- src/ui/components/Group.tsx @@ -98,6 +99,7 @@
- src/ui/components/GroupBrief.tsx @@ -7,6 +7,7 @@
- src/ui/components/GroupBrief.tsx @@ -44,10 +45,18 @@
- src/ui/components/GroupBrief.tsx @@ -81,7 +90,7 @@
- src/ui/components/LookForList.tsx @@ -1,18 +1,177 @@
- src/ui/components/Overview.tsx @@ -4,20 +4,23 @@
- src/ui/components/Overview.tsx @@ -46,8 +49,12 @@
- src/ui/components/ReviewStage.tsx @@ -8,6 +8,7 @@
- src/ui/components/ReviewStage.tsx @@ -39,6 +40,8 @@
- src/ui/components/ReviewStage.tsx @@ -58,7 +61,13 @@
- src/ui/components/ReviewStage.tsx @@ -88,6 +97,7 @@