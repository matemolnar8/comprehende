Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e8001407966c147fd9db26c1f4a8db24108c0ee8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e8001407966c147fd9db26c1f4a8db24108c0ee8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e8001407966c147fd9db26c1f4a8db24108c0ee8

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e8001407966c147fd9db26c1f4a8db24108c0ee8

Review concern 02 of 03: Header and mobile chevrons (`chrome`)

Part: Group walk

The why:

[this session](source:s3) keeps chrome but not a footer. [e800140](source:s5) puts previous and next in the existing header.

The what:

`GroupNav` is icon-only. `Header` and `MobileShell` mount it. `App` passes selection into `Header`.

Look for:
- The desktop chevrons sit in the header row next to `[` `]`. They do not add a second bar under the stage.

Depends on:
- 01 Neighbor walk (`walk`)

Hunk refs for this concern:
- src/ui/components/GroupNav.tsx @@ -0,0 +1,63 @@
- src/ui/components/Header.tsx @@ -8,12 +8,16 @@
- src/ui/components/Header.tsx @@ -31,6 +35,15 @@
- src/ui/components/MobileShell.tsx @@ -6,6 +6,7 @@
- src/ui/components/MobileShell.tsx @@ -44,6 +45,7 @@
- src/ui/App.tsx @@ -341,6 +343,8 @@