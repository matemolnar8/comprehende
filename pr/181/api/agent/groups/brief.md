Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 587e7aebf3074a2288cf7bee6eacfddba4bb3073` and `git rev-parse --verify bb865b7baa24a3c16de3c9282e41c4d095c15628` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  587e7aebf3074a2288cf7bee6eacfddba4bb3073

head               bb865b7baa24a3c16de3c9282e41c4d095c15628

Named refs at pin: 587e7aeb ... bb865b7b

Read the diff:

git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628

Review concern 03 of 08: Overview and group brief (`brief`)

The why:

Máté says the Ask agent button does not look like a button [session](source:s2). The other brief changes answer the design reviews in the same session.

The what:

`Overview` and `GroupBrief` lay out the why, the what, the attention, questions, and sources through the `Kicker` labels and rail, with the outlined `AskAgent` split button beside the title.

Depends on:
- 01 Shared controls and tokens (`controls`)

Hunk refs for this concern:
- src/ui/components/Overview.tsx
- src/ui/components/Group.tsx
- src/ui/components/GroupBrief.tsx
- src/ui/components/Kicker.tsx
- src/ui/components/Attention.tsx
- src/ui/components/QuestionList.tsx
- src/ui/components/SourceList.tsx
- src/ui/components/SourceCite.tsx
- src/ui/components/LookForList.tsx
- src/ui/components/InlineMd.tsx
- src/ui/lib/inline-md.ts
- src/ui/lib/inline-md.test.ts
- src/ui/lib/hyphen-runs.ts
- src/ui/lib/hyphen-runs.test.ts
- src/ui/components/AskAgent.tsx
- src/ui/components/Changes.tsx