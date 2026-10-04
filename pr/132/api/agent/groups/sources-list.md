Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 9e1a4edadbfb87ab47458352767dc22fa0052f02` and `git rev-parse --verify 77ca76e50a4efc5d945d8aa19bcc0f0c7c93fd9c` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 9e1a4edadbfb87ab47458352767dc22fa0052f02 77ca76e50a4efc5d945d8aa19bcc0f0c7c93fd9c -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  9e1a4edadbfb87ab47458352767dc22fa0052f02

head               77ca76e50a4efc5d945d8aa19bcc0f0c7c93fd9c

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames 9e1a4edadbfb87ab47458352767dc22fa0052f02 77ca76e50a4efc5d945d8aa19bcc0f0c7c93fd9c

Review concern 01 of 01: Collapsible sources (`sources-list`)

The why:

[The request](source:s1) asks for sources to stay out of the way until opened, and to show at most three rows.

The what:

`SourceList` renders a closed disclosure. When it is open and there are more than three sources, the list height is the first three rows and the rest scroll.

Hunk refs for this concern:
- src/ui/components/SourceList.module.css
- src/ui/components/SourceList.tsx