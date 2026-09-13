Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify aece9b956fb88e22b77355743e7ca0eadffe645b` in this repository.
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

head               aece9b956fb88e22b77355743e7ca0eadffe645b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 aece9b956fb88e22b77355743e7ca0eadffe645b

Commits:
- aece9b9 Keep Overview lookFor as a compact owner index.
- 61a6692 Drop strand dots from lookFor owners.
- f64dc81 Surface lookFor and sources as scan-and-jump lanes.
- 9587963 Merge pull request #74 from matemolnar8/cursor/writing-for-agents-skill-763a
- 98d61ee Require writing-for-agents when editing the comprehende skill
- 1f13a23 Install writing-for-agents from mattpocock/skills

Sources:
- ticket #71 Make lookFor and sources a scan-and-jump surface. Do not store pass/fail. Do not host forge comments.
  https://github.com/matemolnar8/comprehende/issues/71
- pr PR #76 Implements the lookFor and sources lanes, then a compact Overview index.
  https://github.com/matemolnar8/comprehende/pull/76
- transcript Cursor session · Sep 13 Leave skills-next/comprehende/SKILL.md unchanged unless the issue requires it.
- transcript Cursor session · Overview dump Keep the cleaner lookFor UI on groups. Do not dump every lookFor on Overview.

The title:

Surface lookFor and sources as triage lanes

The why:

[#71](source:s1) wants document and group lookFor, plus related sources, easy to scan and jump from in the fixed UI.

The what (medium):

Overview shows a compact Look for owner index with counts and jumps. Group pages keep the full claim list. Sources jump to a pin, a citing claim, or the named group.

Look for:
- [#71](source:s1) forbids storing pass/fail on lookFor. LookForClaim has no status field, and LookForList has no checkbox.
- [#71](source:s1) asks to list claims and jump to the owner. Overview LookForIndex shows counts and owner jumps, not every claim sentence.
- [The later feedback](source:s4) says Overview must not dump every lookFor. Document claims sit in a closed details row.
- [#71](source:s1) puts hosting forge review comments out of scope. This diff does not add a comment host or a sync.
- [The first follow-up](source:s3) says leave SKILL.md alone. This diff does not edit skills-next/comprehende/SKILL.md.

## Review concerns

### 01 Claim list without a grade (`claim-model`)

`lookForClaims` walks document then group bullets, parses risk tags, and buckets them by owner.

[groups/claim-model.md](groups/claim-model.md)

### 02 Look for lane (`look-for-lane`)

`LookForIndex` on Overview is counts and owner jumps. `LookForList` on GroupBrief is the full sentences.

Depends on:
- 01 Claim list without a grade (`claim-model`)

[groups/look-for-lane.md](groups/look-for-lane.md)

### 03 Sources jump (`sources-lane`)

SourceList gist clicks call onOpenSource. A label with a url still opens that url.

Depends on:
- 01 Claim list without a grade (`claim-model`)

[groups/sources-lane.md](groups/sources-lane.md)

### 04 Focus and stack counts (`focus-stack`)

`App` stores focusLookForKey, and Sidebar prints Look for counts on Overview and on groups that have bullets.

Depends on:
- 02 Look for lane (`look-for-lane`)
- 03 Sources jump (`sources-lane`)

[groups/focus-stack.md](groups/focus-stack.md)