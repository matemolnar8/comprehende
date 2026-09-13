Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Named refs at pin: 30060c417b8961cba2924a994cf9b6a07213c674 ... 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Review concern 02 of 04: Overview index and group lists (`surfaces`)

Part: Look for lanes

The why:

[#71](source:s1) needs a scan surface on Overview and the full list next to the diff.

The what:

`LookForIndex` counts owners on Overview. `LookForList` still lists every claim on the group page.

Look for:
- Open the Overview document row: whole-change claims stay behind a closed details until that row is opened.

Depends on:
- 01 Claim model and jump targets (`model`)

Hunk refs for this concern:
- src/ui/components/LookForList.tsx @@ -1,18 +1,177 @@
- src/ui/components/Overview.tsx @@ -4,20 +4,23 @@
- src/ui/components/Overview.tsx @@ -46,8 +49,12 @@
- src/ui/components/GroupBrief.tsx @@ -9,6 +9,7 @@
- src/ui/components/GroupBrief.tsx @@ -45,8 +46,9 @@
- src/ui/components/GroupBrief.tsx @@ -54,6 +56,13 @@
- src/ui/components/GroupBrief.tsx @@ -72,7 +81,7 @@
- src/ui/components/Group.tsx @@ -31,6 +31,7 @@
- src/ui/components/Group.tsx @@ -95,6 +96,7 @@
- src/ui/components/SourceList.tsx @@ -1,6 +1,8 @@
- src/ui/components/SourceList.tsx @@ -11,6 +13,7 @@
- src/ui/components/SourceList.tsx @@ -23,14 +26,16 @@
- src/ui/components/SourceList.tsx @@ -47,18 +52,31 @@
- src/ui/components/Sidebar.tsx @@ -21,6 +21,8 @@
- src/ui/components/Sidebar.tsx @@ -32,6 +34,7 @@
- src/ui/components/Sidebar.tsx @@ -70,6 +73,7 @@
- src/ui/components/Sidebar.tsx @@ -115,6 +119,7 @@
- src/ui/components/Sidebar.tsx @@ -122,6 +127,7 @@
- src/ui/components/Sidebar.tsx @@ -131,8 +137,10 @@
- src/ui/components/Sidebar.tsx @@ -169,6 +177,11 @@