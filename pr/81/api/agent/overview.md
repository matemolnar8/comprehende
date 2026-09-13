Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 371b8bda48b97150464e654926c3e84ca29bfdad` and `git rev-parse --verify c14a89b5503d1688c9ba6902e74ff4abb6bafd51` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  371b8bda48b97150464e654926c3e84ca29bfdad

head               c14a89b5503d1688c9ba6902e74ff4abb6bafd51

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 371b8bda48b97150464e654926c3e84ca29bfdad c14a89b5503d1688c9ba6902e74ff4abb6bafd51

Commits:
- c14a89b Prefer the current group when opening a shared source

Sources:
- transcript Cursor session · Sep 13 Clicking a source from a group's Sources list jumped to Overview when document lookFor also cited that source.
- pr PR #81 The pull request names the same stay-on-group ranking.
  https://github.com/matemolnar8/comprehende/pull/81

The title:

Keep group source clicks on the current group

The why:

[The request](source:s1) says a source listed on a group must not jump to Overview when document lookFor also cites it.

The what (small):

`openTargetForSource` prefers the current group's lookFor, then any group that lists the source, then document lookFor. `App` passes the current group id into that ranking.

Look for:
- [The request](source:s1) also wants a document-only cite to open Overview. That path is the last lookFor step, after group claims and named membership.

## Review concerns

### 01 Prefer the current group (`source-open`)

`openTargetForSource` ranks pin, current group lookFor, `groupSourceIds` membership, any group lookFor, named sources, then document lookFor. `App.openSource` passes the current group id.

[groups/source-open.md](groups/source-open.md)