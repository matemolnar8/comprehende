Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f9d12b75708f86c165bb8249aa024f7914a785ef` and `git rev-parse --verify 5d59f087125233c028b0b844984838da3e3df2bf` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f9d12b75708f86c165bb8249aa024f7914a785ef 5d59f087125233c028b0b844984838da3e3df2bf -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f9d12b75708f86c165bb8249aa024f7914a785ef

head               5d59f087125233c028b0b844984838da3e3df2bf

Named refs at pin: origin/main ... t3/agent-deep-links

Read the diff:

git diff --find-renames f9d12b75708f86c165bb8249aa024f7914a785ef 5d59f087125233c028b0b844984838da3e3df2bf

Review concern 03 of 03: Split Ask button with the picker (`ask-button`)

The why:

The user asked for [a target picker on all AI buttons](source:s2).

The what:

`AskAgent` replaces `CopyPrompt` at the overview, group and question call sites, and adds a ▾ menu built on the new Radix `dropdown-menu`; a link target renders the button as an `<a href>`.

Depends on:
- 02 Agent targets and the shared choice (`targets`)

Hunk refs for this concern:
- src/ui/components/AskAgent.tsx
- src/ui/components/CopyPrompt.tsx
- src/ui/components/ui/dropdown-menu.tsx
- src/ui/components/GroupBrief.tsx
- src/ui/components/Overview.tsx
- src/ui/components/QuestionList.tsx
- package.json