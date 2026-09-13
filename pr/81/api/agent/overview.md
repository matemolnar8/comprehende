Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 12dc578a96810c629d63f94bcecac8b92a395800` and `git rev-parse --verify 337dd8ad67526981781d98e930041010ae467d85` in this repository.
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

base (merge-base)  12dc578a96810c629d63f94bcecac8b92a395800

head               337dd8ad67526981781d98e930041010ae467d85

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 12dc578a96810c629d63f94bcecac8b92a395800 337dd8ad67526981781d98e930041010ae467d85

Commits:
- 337dd8a Let the overview brief start quiet and keep source rows in bounds
- b1f6b4f Give the brief one type scale and a hanging scan column
- d96be75 Tone down hop underlines and kickers
- ea15619 Paint hop underlines on the text node
- 3f2bc56 Open Overview lookFor and style review hops as links
- 83f549c Prefer the current group when opening a shared source

Sources:
- pr PR #81 A source cited on document lookFor and on a group jumped to Overview because claims.find hit the document claim first.
  https://github.com/matemolnar8/comprehende/pull/81
- commit 83f549c Prefer the current group when opening a shared source Prefer the current group's lookFor cite, then any group lookFor, then named membership.
  https://github.com/matemolnar8/comprehende/commit/83f549cc93ad95bc2ecf0771e8faa4fe30167239
- commit 3f2bc56 Open Overview lookFor and style review hops as links Overview lookFor starts expanded with a disclosure chevron. Hops use hash links.
  https://github.com/matemolnar8/comprehende/commit/3f2bc5698be897a9d7afd5047166d0db06f812e1
- transcript Cursor session · Sep 13 Asked for one type scale, hanging Why/What/Look for, less data at once, no double list rules, and source-row truncation that works on long labels.
- commit 337dd8a Let the overview brief start quiet and keep source rows in bounds Collapse the Overview look-for index until opened, use a single divide, and truncate long source labels.
  https://github.com/matemolnar8/comprehende/commit/337dd8ad67526981781d98e930041010ae467d85

The title:

Keep source clicks on the group and quiet the brief

The what (medium):

`openTargetForSource` stays on the current group when that group cites or lists the source. Nav, sources, and look-for hops become hash links. The brief hangs Why, What, Look for, and Sources in one body size, and Overview look-for starts collapsed.

Look for:
- [PR #81](source:s1) and [3f2bc56](source:s3) say Overview lookFor starts expanded. [337dd8a](source:s5) opens that disclosure only when a document claim is focused.
- [PR #81](source:s1) test plan says hop labels are underlined `<a href>` targets. `hashLinkText` underlines on hover; resting underline is gone on cards and nav.

## Review concerns

### 01 Prefer the current group for a shared source (`prefer-group`)

`openTargetForSource` prefers a line pin, then a lookFor owned by `currentGroupId`, then `groupSourceIds` on that group, then any group lookFor, named `group.sources`, document lookFor, Overview.

[groups/prefer-group.md](groups/prefer-group.md)

### 02 HashLink and plain-click guard (`hash-link`)

`HashLink` writes `serializeHash` and calls `onSelect` only when `isPlainLeftClick` is true. `hashLinkText` is hover underline for running text.

[groups/hash-link.md](groups/hash-link.md)

### 03 Wire hops to HashLink (`wire-hops`)

Sidebar, Overview group rows, Look for index hops, SourceList jumps, and HopList use `HashLink`. Source rows call `selectionForSource`.

Depends on:
- 01 Prefer the current group for a shared source (`prefer-group`)
- 02 HashLink and plain-click guard (`hash-link`)

[groups/wire-hops.md](groups/wire-hops.md)

### 04 Hanging brief fields and one title size (`hanging-brief`)

`BriefField` hangs kickers in a 5.75rem column. Why, What, Look for, and Sources share `briefProse`. Title uses `--text-title` / `--text-title-sm`. Overview group rows drop display numerals.

[groups/hanging-brief.md](groups/hanging-brief.md)

### 05 Quiet Overview look-for and single divides (`lookfor-quiet`)

Overview document look-for starts closed unless a document claim is focused. Lists use `briefRows` (`divide-y` only). Tagged claims hang the tag in a 4.75rem column.

Depends on:
- 04 Hanging brief fields and one title size (`hanging-brief`)

[groups/lookfor-quiet.md](groups/lookfor-quiet.md)

### 06 Truncate long source labels (`source-truncate`)

Source labels cap at 40% and truncate. The gist is `flex-1 truncate` inside an `overflow-hidden` row.

Depends on:
- 04 Hanging brief fields and one title size (`hanging-brief`)
- 03 Wire hops to HashLink (`wire-hops`)

[groups/source-truncate.md](groups/source-truncate.md)