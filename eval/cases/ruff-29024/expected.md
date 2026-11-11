# ruff-29024: [ty] Preserve cycle markers in ParamSpec specialization

PR #29024 in astral-sh/ruff, which addresses one reproducer of ty issue 4615. One small type-checker fix in Rust plus two corpus regression files. Three bot comments report no change in conformance, memory, and ecosystem results. No human review comments.

## Story

- Title: the PR title, "[ty] Preserve cycle markers in ParamSpec specialization".
- Why: present, from ty issue 4615 and the PR body. The issue says ty panics with "too many cycle iterations" when a decorated generic class is specialized in a loop. The PR body says repeated specialization keeps growing the inferred type until cycle inference panics.
- Size: small.
- Parts: one story, so no parts or one part.
- Groups: 1.

## Groups

1. ParamSpec cycle-marker fix with its regression files: `crates/ty_python_semantic/src/types/infer/builder/subscript.rs`, `crates/ty_python_semantic/resources/corpus/ty_4615_recursive_paramspec_legacy.py`, `crates/ty_python_semantic/resources/corpus/ty_4615_recursive_paramspec_pep695.py`. The two corpus files reproduce the panic that the one-condition change in `subscript.rs` fixes, so they read together.

## Must

- When a single type argument specializes a class whose only type variable is a `ParamSpec`, a `Divergent` cycle marker now becomes the parameter list `(Divergent, /)` through `Parameters::from_annotation` instead of `Parameters::unknown()`.
- The only behavior change in `subscript.rs` is the condition `param_type.is_dynamic()` becoming `param_type.is_non_divergent_dynamic()`; the rest of the hunk is reindentation and one new comment.
- The PR fixes only the first reproducer of ty issue 4615, the generic class specialized in a loop, and says #29025 and #28986 cover the lambda and collection decorator reproducers.

## Good

- `is_non_divergent_dynamic` already exists at base in `crates/ty_python_semantic/src/types.rs` as `is_dynamic() && !is_divergent()`, so the PR adds no new helper.
- `Type::is_dynamic` counts a `Divergent` only when its `materialization` is `None`, so a materialized `Divergent` already took the `from_annotation` branch before this change.
- The corpus files run through `corpus_no_panic` in `crates/ty_python_semantic/tests/corpus.rs`, which only checks that ty infers every expression without a panic and asserts no inferred type.
- The two corpus files reproduce the same recursive specialization, once with legacy `Generic[P]` syntax and once with PEP 695 `class C[**P]` syntax.
- The bot comments report no change in typing conformance, memory usage, or ecosystem diagnostics.

## Must not

- Do not describe the reindented `let parameters` block as new logic or as a change to the `Todo`, `Any`, or `Unknown` handling.
- Do not claim the corpus files check the inferred type; they only guard against a panic.
- Do not claim the PR fixes every reproducer in ty issue 4615.
- Do not write a group attention that asks for an mdtest that checks the inferred type, or a new name for `is_non_divergent_dynamic`; a missing test and a nit are not attentions.
- Do not write a group question that asks why a `Divergent` marker now becomes `(Divergent, /)` instead of `Parameters::unknown()`; the PR body says inference needs the marker to normalize the cycle.

## Notes

The `materialization` detail and the no-panic-only corpus harness are `Good` because they need `types.rs` and `tests/corpus.rs`, which the diff does not touch. The reindent claim is `Must` because rustfmt rewrote the whole block, and a reader who misses the one changed condition misjudges the size of the fix. The `Todo`, `Any`, and `Unknown` handling is unchanged, and the PR body says so, so the reindent `Must` covers it. Past runs often missed the `Divergent` versus `Unknown` split.

ty issue 4615 lists three reproducers and stays open. The PR body hands the lambda reproducer (seed 16371) and the collection decorator reproducer (seed 15216) to #29025 and #28986. That scope verdict is the `Must` on the issue.

`size` allows `trivial` because the code change is one condition. `groups` allows 2 for a review that adds a duplicate or context group, but `together` keeps all three files in one group. No `apart` pairs: the diff has only these three files and they form one concern.

Homes: the issue scope verdict is a document `lookFor` bullet. The other Must claims live in the group summary, why, or file notes. The group needs no attention: the fix is one condition, and the reindent is a fact for the summary.
