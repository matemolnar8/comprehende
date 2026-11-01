Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify de6c86b23284d2dc40e2633828c3854e1e8e6b1a` and `git rev-parse --verify 02739aebc0a4f3928a5867376d0363b45591795d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 02739aebc0a4f3928a5867376d0363b45591795d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  de6c86b23284d2dc40e2633828c3854e1e8e6b1a

head               02739aebc0a4f3928a5867376d0363b45591795d

Named refs at pin: origin/main ... t3/agent-deep-links

Read the diff:

git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 02739aebc0a4f3928a5867376d0363b45591795d

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