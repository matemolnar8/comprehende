Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e91cd52b349b2a9d148910cbd0b57f1145d4e2a0` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e91cd52b349b2a9d148910cbd0b57f1145d4e2a0 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e91cd52b349b2a9d148910cbd0b57f1145d4e2a0

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e91cd52b349b2a9d148910cbd0b57f1145d4e2a0

Review concern 01 of 06: Read a part in dependsOn order (`order`)

Part: Story navigation

The why:

Later navigation needs one ordered list of groups per story.

The what:

`groupParts` topological-sorts `dependsOn` inside a part, then `suggestedOrder`.

Look for:
- If `login` lists `dependsOn: ["cookie"]` but has a lower suggestedOrder, the part list is still cookie then login.

Hunk refs for this concern:
- src/ui/lib/parts.ts @@ -3,7 +3,8 @@
- src/ui/lib/parts.ts @@ -13,7 +14,7 @@
- src/ui/lib/parts.ts @@ -21,7 +22,7 @@
- src/ui/lib/parts.ts @@ -36,11 +37,12 @@
- src/ui/lib/parts.ts @@ -53,6 +55,36 @@
- src/ui/lib/parts.ts @@ -71,6 +103,41 @@