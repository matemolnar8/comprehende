Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 9e1a4edadbfb87ab47458352767dc22fa0052f02` and `git rev-parse --verify 77ca76e50a4efc5d945d8aa19bcc0f0c7c93fd9c` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- 77ca76e Collapse sources by default and scroll after three rows

Sources:
- transcript Sources collapse scroll Make sources collapsible, collapsed by default, with room for three rows and a scroll for the rest.

The title:

Collapse sources and scroll after three rows

The why:

Sources are a secondary part of the brief and often take a lot of vertical space.

The what (small):

The sources list on the overview and on each group starts closed. Opening it shows three rows; further sources scroll inside that list.

## Review concerns

### 01 Collapsible sources (`sources-list`)

`SourceList` renders a closed disclosure. When it is open and there are more than three sources, the list height is the first three rows and the rest scroll.

[groups/sources-list.md](groups/sources-list.md)