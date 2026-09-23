Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d68a36eb83b8d412745643c86db7be65851f1c01` and `git rev-parse --verify fe3f8acbfa301232ca8380ef4377aee004f1d3f5` in this repository.
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

base (merge-base)  d68a36eb83b8d412745643c86db7be65851f1c01

head               fe3f8acbfa301232ca8380ef4377aee004f1d3f5

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames d68a36eb83b8d412745643c86db7be65851f1c01 fe3f8acbfa301232ca8380ef4377aee004f1d3f5

Commits:
- fe3f8ac Show how many files are left to read in this session.

Sources:
- ticket #111 Asks for a session checklist of viewed files and files still left, with no verdict on the change.
  https://github.com/matemolnar8/comprehende/issues/111

The title:

Show files left to read in this session

The why:

[Issue #111](source:s1) asks for a session checklist of files the reader marked viewed and files still left. The mark is attention, not a verdict on the change.

The what (small):

The UI shows how many files are still left to read. A viewed mark stays in the browser session for the base and head commits.

Look for:
- [Issue #111](source:s1) says the review file must not store a pass or a fail. Viewed paths stay in session storage, and the review document gains no field.

## Review concerns

### 01 Count files left (`counts`)

`readingCounts` and `readingStatus` name how many paths are still left, and `reviewReadingPaths` keeps each path once.

[groups/counts.md](groups/counts.md)

### 02 Show the count in the review (`marks`)

The header, the sidebar, the overview, the group page, and the file rail show `ReadingMark` from the session viewed set.

Depends on:
- 01 Count files left (`counts`)

[groups/marks.md](groups/marks.md)

### 03 Note where viewed marks live (`readme`)

The Develop section says a viewed mark stays in the browser session and is not stored in the review file.

Depends on:
- 02 Show the count in the review (`marks`)

[groups/readme.md](groups/readme.md)