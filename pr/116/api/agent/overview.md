Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4c59452449c16ba800b5753c21f1202692cc242c` and `git rev-parse --verify 993e40a2b984d0c2f4979f8367190719f4c7b97e` in this repository.
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

base (merge-base)  4c59452449c16ba800b5753c21f1202692cc242c

head               993e40a2b984d0c2f4979f8367190719f4c7b97e

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c 993e40a2b984d0c2f4979f8367190719f4c7b97e

Commits:
- 993e40a State the stale E2E_UI note in the cigster-99 claim.
- 15eef49 Pin comprehende-39 to the gitCommonDir move instead of the gitEnv caller.
- d3c79e3 Add cigster-84, cigster-99, and cigster-118 eval cases with frozen bundles.
- a9ed254 Expect exec.ts and skill-sync.ts together on comprehende-39.
- 76b8f54 Accept a commit source label that drops the subject's final period.
- 105af69 Let eval cases carry a git bundle so private repos run without a clone.

Sources:
- transcript Cursor session · Sep 23 Add cigster-84, cigster-99, and cigster-118 as foreign graded cases that run in CI without GitHub auth, and review comprehende-39 and comprehende-47 after main run 35823530539.

The title:

Add cigster eval cases and review existing expects

The why:

Máté asked for graded eval cases from three private cigster PRs that the public Eval suite can run, and for a pass over the cases that failed on main ([request](source:s1)).

The what (medium):

Eval cases can now ship a `repo.bundle` so the runner never clones the repo, and three cigster cases use it. The commit-label check ignores a dropped final period, and comprehende-39 now expects the `gitCommonDir` move instead of the `gitEnv` caller.

Look for:
- The request asks for private cigster cases that run in the public Eval suite without a token. Each case bundles its own git objects, so `eval.yml` is unchanged ([request](source:s1)).
- The request names two main failures. comprehende-47 was the harness being too strict, and comprehende-39 had an `apart` pair that contradicts the skill ([request](source:s1)).

## Review concerns

### 01 Bundle a case's git history (`bundle`)

`writeCaseBundle` cuts history at `base` into `repo.bundle`, and `cloneCaseBundle` rebuilds a shallow bare repo from it with `base` as the boundary.

[groups/bundle.md](groups/bundle.md)

### 02 Write and read bundles (`bundle-wiring`)

`eval:add --bundle` writes `repo.bundle` next to `case.json`, and `runEval` opens that bundle in the temp dir instead of the shared clone cache.

Depends on:
- 01 Bundle a case's git history (`bundle`)

[groups/bundle-wiring.md](groups/bundle-wiring.md)

### 03 cigster-84, cigster-99, and cigster-118 (`cigster-cases`)

Frozen PR, issue, and comment sources, each with a `repo.bundle` of about 6.5 MB and an `expect` that follows the skill's grouping and lookFor rules.

Depends on:
- 02 Write and read bundles (`bundle-wiring`)

[groups/cigster-cases.md](groups/cigster-cases.md)

### 04 Commit label without the final period (`commit-label`)

`commitSourceFailures` compares subjects through `subjectKey`, which trims whitespace and trailing periods on both sides.

[groups/commit-label.md](groups/commit-label.md)

### 05 comprehende-39 expects the gitCommonDir move (`case-39`)

The case now expects `repo.ts` and `lfs.ts` together and `exec.ts` apart from `lfs.ts`, and the case test no longer requires every case to expect `why` present with no `together`.

[groups/case-39.md](groups/case-39.md)