Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df873e1ce47b46b505633f316d2b6c4c4bffb04a` and `git rev-parse --verify eb01e4a6ff3b0b2876b368712a7947d70ab1ac22` in this repository.
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

base (merge-base)  df873e1ce47b46b505633f316d2b6c4c4bffb04a

head               eb01e4a6ff3b0b2876b368712a7947d70ab1ac22

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames df873e1ce47b46b505633f316d2b6c4c4bffb04a eb01e4a6ff3b0b2876b368712a7947d70ab1ac22

Commits:
- eb01e4a Paint hop underlines on the text node
- bd60dba Open Overview lookFor and style review hops as links
- 2bc2fad Prefer the current group when opening a shared source

Sources:
- transcript Cursor session · Sep 13 Clicking a source from a group's Sources list jumped to Overview when document lookFor also cited that source.
- pr PR #81 The pull request names the stay-on-group ranking, then a polish pass for lookFor and source hops.
  https://github.com/matemolnar8/comprehende/pull/81

The title:

Keep group source clicks on the current group

The why:

[The request](source:s1) says a source listed on a group must not jump to Overview when document lookFor also cites it.

The what (small):

`openTargetForSource` prefers the current group's lookFor, then any group that lists the source, then document lookFor. Overview lookFor starts open, hops use hash links, and source labels match claim text.

Look for:
- [The request](source:s1) also wants a document-only cite to open Overview. That path is the last lookFor step, after group claims and named membership.

## Review concerns

### 01 Prefer the current group (`source-open`)

`openTargetForSource` ranks pin, current group lookFor, `groupSourceIds` membership, any group lookFor, named sources, then document lookFor. `App` passes the current group id.

[groups/source-open.md](groups/source-open.md)

### 02 Look for chevrons and hash links (`nav-polish`)

`HashLink` writes the selection hash. Overview lookFor starts expanded with a disclosure chevron. Sidebar, lookFor rows, and sources use those links. Source labels match lookFor claim text.

Depends on:
- 01 Prefer the current group (`source-open`)

[groups/nav-polish.md](groups/nav-polish.md)