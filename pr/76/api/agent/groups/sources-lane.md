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

Review concern 03 of 04: Sources jump (`sources-lane`)

The why:

[#71](source:s1) also wants related sources easy to jump from, without hosting forge comments.

The what:

SourceList gist clicks call onOpenSource. A label with a url still opens that url.

Look for:
- openTargetForSource prefers a line pin, then the first citing lookFor, then group.sources, then Overview.

Depends on:
- 01 Claim list without a grade (`claim-model`)

Hunk refs for this concern:
- src/ui/components/SourceList.tsx @@ -1,6 +1,8 @@
- src/ui/components/SourceList.tsx @@ -11,6 +13,7 @@
- src/ui/components/SourceList.tsx @@ -23,14 +26,16 @@
- src/ui/components/SourceList.tsx @@ -47,18 +52,31 @@
- src/ui/lib/sources-context.tsx @@ -5,6 +5,7 @@