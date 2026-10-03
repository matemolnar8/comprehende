# ruff-29024: Preserve cycle markers in ParamSpec specialization

PR #29024. The frozen issue file holds ruff PR #4615 about printer flags. It is not the ty issue 4615 named in the PR body. Three bot comments report no change in conformance, memory, and ecosystem results. No human review comments exist.

## Story

- Title: the PR title.
- Why: present, from the PR. The PR says recursive specialization must keep its cycle marker so inference can normalize it. Without the marker the type keeps growing until cycle inference panics. Do not take the motive from the frozen issue file. That file is unrelated.
- Size: small.
- Parts: one story. Groups: 1.

## Groups

1. ParamSpec cycle fix with corpus tests: `crates/ty_python_semantic/src/types/infer/builder/subscript.rs`, `crates/ty_python_semantic/resources/corpus/ty_4615_recursive_paramspec_legacy.py`, `crates/ty_python_semantic/resources/corpus/ty_4615_recursive_paramspec_pep695.py`. The two corpus files test the same fix with legacy and PEP 695 syntax. They belong with the logic.

## Must state

- the fix keeps Divergent cycle markers in ParamSpec calls instead of mapping them to unknown parameters. Unknown still falls back to unknown parameters.
- the two new corpus files test recursive ParamSpec specialization with legacy and PEP 695 syntax for the generic specialization reproducer in ty issue 4615.

## Good to state

- The PR says the lambda and collection reproducers are covered by #29025 and #28986. This PR covers only the generic specialization reproducer.
- The existing fallback for Unknown is unchanged.
- Bot comments report no change in conformance, memory, or ecosystem results.

## Must not

- Do not split the logic from the corpus files into one group per file.
- Do not cite the frozen ruff PR #4615 as the motive or as ty issue 4615.
- Do not make document lookFor from the bot comments. No source differs from the diff, so document lookFor stays empty.
- Do not restate the test plan as lookFor. Name only what a reader would miss.

## Baseline

- First musecode run: 1 group, parts 0, size small, claims 1 of 2. No expects change.
- Second musecode run: same shape, claims 0 of 2. Substance present, grader strict. No expects change.
- Third musecode run: same shape, claims 2 of 2.

## case.json

- `why` is present, from the PR. The frozen issue file is unrelated.
- `parts` is 0 to 1 for one story.
- `groups` is 1 to 2. Best is 1, with slack for a split of the corpus files.
- `size` is small and medium. Best is small, with neighbor slack.
- `sourceKinds` is pr. The PR is the only story source. Bot comments are noise.
- `together` holds the logic file with both corpus files. They test one fix.
- Added the two claims from Must state.
