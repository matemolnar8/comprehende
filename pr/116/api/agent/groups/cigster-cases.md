Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a00142284953190a1c5d269f7805cefc09be2995` and `git rev-parse --verify a610a8c226a46a202300b570b1519382fa6a92cd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a00142284953190a1c5d269f7805cefc09be2995 a610a8c226a46a202300b570b1519382fa6a92cd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a00142284953190a1c5d269f7805cefc09be2995

head               a610a8c226a46a202300b570b1519382fa6a92cd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a00142284953190a1c5d269f7805cefc09be2995 a610a8c226a46a202300b570b1519382fa6a92cd

Review concern 03 of 04: cigster-84, cigster-99, and cigster-118 (`cigster-cases`)

Part: Bundled cases

The why:

Adds foreign cases from a different repo shape: test fixtures, a large mixed e2e PR, and an analytics feature ([request](source:s1)).

The what:

Frozen PR, issue, and comment sources, each with a `repo.bundle` of about 6.5 MB and an `expect` that follows the skill's grouping and lookFor rules.

Look for:
- cigster-99 omits the `why` expect, because its PR names two stories under one ticket.
- Each `claims` entry is a mismatch between a source and the diff, such as the stale `E2E_UI` note in PR #99. Claims do not fail a case.

Depends on:
- 02 Write and read bundles (`bundle-wiring`)

Hunk refs for this concern:
- eval/cases/cigster-84/case.json
- eval/cases/cigster-84/sources/comments.json
- eval/cases/cigster-84/sources/issue-82.json
- eval/cases/cigster-84/sources/pr.json
- eval/cases/cigster-84/sources/review-comments.json
- eval/cases/cigster-99/case.json
- eval/cases/cigster-99/sources/comments.json
- eval/cases/cigster-99/sources/issue-98.json
- eval/cases/cigster-99/sources/pr.json
- eval/cases/cigster-99/sources/review-comments.json
- eval/cases/cigster-118/case.json
- eval/cases/cigster-118/sources/comments.json
- eval/cases/cigster-118/sources/issue-104.json
- eval/cases/cigster-118/sources/pr.json
- eval/cases/cigster-118/sources/review-comments.json