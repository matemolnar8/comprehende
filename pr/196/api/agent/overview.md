Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6854906c4b4b901e5047622203c2e9b45854959` and `git rev-parse --verify f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd` in this repository.
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
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  a6854906c4b4b901e5047622203c2e9b45854959

head               f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6854906c4b4b901e5047622203c2e9b45854959 f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd

Commits:
- f00f1c4c Eval: drop the .nvmrc part pair; vitadeck-150 needs five parts; QR fix is its own part
- e0c9229f Eval: test the partsApart case line; note where partsApart flakes
- 5caeb5c2 Eval: score part decisions with partsTogether and partsApart

The title:

Eval: score part decisions with partsTogether and partsApart

The what (small):

Eval cases can name files that must share a part or sit in different parts, and two cases use it.

## Review concerns

### 01 Part-level expects (`checks`)

`case.ts` accepts `partsTogether` and `partsApart`, and `runDeterministicChecks` in `checks.ts` scores them like `together` and `apart`, but per part. A group with no `part` counts as one unnamed story, so a one-story review fails every `partsApart` pair.

Attention (contract):
`unheldPaths` fails a part expect when no group holds one of its paths, while group-level `apart` passes in that case. A pair on a lockfile such as `pnpm-lock.yaml`, which sits in no group, therefore fails every run instead of passing for free. Decide whether a case author should get that failure or a silent pass.

[groups/checks.md](groups/checks.md)

### 02 Expects for two cases (`cases`)

cigster-99 keeps the audit report and the QR hook fix out of the living-room story part, and vitadeck-150 keeps its five fixes in five parts. Each `expected.md` Notes bullet says what the pairs hold and what stays open.

Attention (product):
Only part decisions that `expected.md` states with no alternative are encoded. The cigster-99 page objects, the harness, and the dependency refresh get no part expect, and vitadeck-144 gets none, because its `expected.md` allows zero to eight parts.

Depends on:
- 01 Part-level expects (`checks`)

[groups/cases.md](groups/cases.md)

### 03 Eval docs (`docs`)

`docs/eval.md` and `eval/review-criteria.md` list the two new expects with the existing ones.

Depends on:
- 01 Part-level expects (`checks`)

[groups/docs.md](groups/docs.md)