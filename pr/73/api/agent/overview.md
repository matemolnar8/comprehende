Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e8f9455cedd00c1d9849edece23a810faeb25d51` in this repository.
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

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e8f9455cedd00c1d9849edece23a810faeb25d51

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e8f9455cedd00c1d9849edece23a810faeb25d51

Commits:
- 9587963 Merge pull request #74 from matemolnar8/cursor/writing-for-agents-skill-763a
- 98d61ee Require writing-for-agents when editing the comprehende skill
- 1f13a23 Install writing-for-agents from mattpocock/skills
- e8f9455 Add next and previous group navigation

Sources:
- ticket #70 Add next and previous across existing groups in document order. Keyboard, chrome, or both. No tour type, no walkthrough script, no chat.
  https://github.com/matemolnar8/comprehende/issues/70
- pr PR #73 Walk overview then groups. Desktop bar and mobile chevrons. Unassigned and lockfiles stay off the path.
  https://github.com/matemolnar8/comprehende/pull/73
- transcript Cursor session · Sep 13 Ship a focused first version humans can try. Walk existing groups only. Do not edit the comprehende skill unless required.
- commit e8f9455 Walk overview then groups from keyboard and chrome. Unassigned and lockfiles stay off the path. The walk does not wrap.
  https://github.com/matemolnar8/comprehende/commit/e8f9455cedd00c1d9849edece23a810faeb25d51

The title:

Next / previous group navigation

The why:

[#70](source:s1) wants humans to move through existing groups without a tour document or a walkthrough script.

The what (small):

`groupWalk` orders overview then groups. `GroupNav` and `[` `]` step that walk and stop at the ends.

Look for:
- [#70](source:s1) says walk existing groups only. Overview is on the walk so Next works from the start page. Unassigned and lockfiles are not.
- [#70](source:s1) allows keyboard, chrome, or both. This diff ships both. It does not add a tour document type.

## Review concerns

### 01 Neighbor walk (`walk`)

`groupWalk` and `neighborSelection` step overview then groups and return undefined at the ends.

[groups/walk.md](groups/walk.md)

### 02 Previous and next chrome (`chrome`)

`GroupNav` shows neighbor titles. `ReviewStage` mounts the bar. `MobileShell` mounts the chevrons.

Depends on:
- 01 Neighbor walk (`walk`)

[groups/chrome.md](groups/chrome.md)

### 03 Bracket keys follow the walk (`keys`)

`App` calls `shiftSelection` on `[` and `]`, ignores key repeat, and calls preventDefault.

Depends on:
- 01 Neighbor walk (`walk`)

[groups/keys.md](groups/keys.md)