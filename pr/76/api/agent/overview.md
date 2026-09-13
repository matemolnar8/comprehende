Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8` in this repository.
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

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Named refs at pin: 30060c417b8961cba2924a994cf9b6a07213c674 ... 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Commits:
- 15b7ca8 Number lookFor owners in part / dependsOn order
- e398380 Keep Overview lookFor as a compact owner index.
- a58407e Drop strand dots from lookFor owners.
- 1e6ae76 Surface lookFor and sources as scan-and-jump lanes.

Sources:
- ticket #71 List claims with source marks and jump into the owning group. Do not store pass/fail.
  https://github.com/matemolnar8/comprehende/issues/71
- pr PR #76 Rebased onto main after #75. Compact Overview lookFor. Keep part chrome.
  https://github.com/matemolnar8/comprehende/pull/76

The title:

Surface lookFor and sources as triage lanes

The why:

[#71](source:s1) wants lookFor and sources as a scan-and-jump triage surface, not a forge comment host.

The what (medium):

`LookForIndex` is a compact owner index on Overview. Group pages still list the full claims. Sources jump to a citing claim, a line pin, or the named group. The header group pager and part hops from #75 stay.

Look for:
- [#71](source:s1) says do not store pass/fail. No hunk adds a checkbox or completion state on a claim.
- Subtle. [#71](source:s1) wants a place to scan and jump. Overview shows owner counts, not the full claim dump.

## Review concerns

### 01 Claim model and jump targets (`model`)

`lookFor.ts` parses tags, buckets claims by owner, and maps a source to a selection.

[groups/model.md](groups/model.md)

### 02 Overview index and group lists (`surfaces`)

`LookForIndex` counts owners on Overview. `LookForList` still lists every claim on the group page.

Depends on:
- 01 Claim model and jump targets (`model`)

[groups/surfaces.md](groups/surfaces.md)

### 03 App wiring for jumps (`wiring`)

`App.tsx` keeps `[` `]` and `{` `}` on `selectFromNav`, and opens lookFor plus sources through `openLookFor` and `openSource`.

Depends on:
- 01 Claim model and jump targets (`model`)
- 02 Overview index and group lists (`surfaces`)

[groups/wiring.md](groups/wiring.md)

### 04 lookFor unit tests (`tests`)

`look-for.test.ts` covers tags, buckets, dependsOn numbering, and source open targets.

[groups/tests.md](groups/tests.md)