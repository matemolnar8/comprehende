# ruff-29024: [ty] Preserve cycle markers in ParamSpec specialization

PR #29024 in astral-sh/ruff. One small type-checker fix in Rust plus two corpus regression files. The frozen issue file holds ruff PR #4615 about `PrinterFlag`, not the ty issue 4615 that the PR body names. Three bot comments report no change in conformance, memory, and ecosystem results. No human review comments.

## Story

- Title: the PR title, "[ty] Preserve cycle markers in ParamSpec specialization".
- Why: present, from the PR body. A recursive specialization must keep its `Divergent` cycle marker so inference can normalize it. Without the marker, repeated specialization keeps growing the inferred type until cycle inference panics. The frozen issue file is unrelated and is not a motive.
- Size: small.
- Parts: one story, so no parts or one part.
- Groups: 1.

## Groups

1. ParamSpec cycle-marker fix with its regression files: `crates/ty_python_semantic/src/types/infer/builder/subscript.rs`, `crates/ty_python_semantic/resources/corpus/ty_4615_recursive_paramspec_legacy.py`, `crates/ty_python_semantic/resources/corpus/ty_4615_recursive_paramspec_pep695.py`. The two corpus files reproduce the panic that the one-condition change in `subscript.rs` fixes, so they read together.

## Must

- When a single type argument specializes a class whose only type variable is a `ParamSpec`, a `Divergent` cycle marker now becomes the parameter list `(Divergent, /)` through `Parameters::from_annotation` instead of `Parameters::unknown()`.
- `Unknown` and the other non-divergent dynamic types still fall back to `Parameters::unknown()`, and `Todo` still maps to `Parameters::todo()` while `Any` still maps to `(Any, /)`.
- The only behavior change in `subscript.rs` is the condition `param_type.is_dynamic()` becoming `param_type.is_non_divergent_dynamic()`; the rest of the hunk is reindentation and one new comment.
- The two new corpus files reproduce the same recursive specialization, `value := C[value]` inside a loop, once with legacy `Generic[P]` syntax and once with PEP 695 `class C[**P]` syntax.

## Good

- `is_non_divergent_dynamic` already exists at base in `crates/ty_python_semantic/src/types.rs` as `is_dynamic() && !is_divergent()`, so the PR adds no new helper.
- `Type::is_dynamic` counts a `Divergent` only when its `materialization` is `None`, so a materialized `Divergent` already took the `from_annotation` branch before this change.
- The corpus files run through `corpus_no_panic` in `crates/ty_python_semantic/tests/corpus.rs`, which only checks that ty infers every expression without a panic and asserts no inferred type.
- The PR addresses only the generic-specialization reproducer of ty issue 4615 and says #29025 and #28986 cover the lambda and collection decorator reproducers.
- The bot comments report no change in typing conformance, memory usage, or ecosystem diagnostics.

## Must not

- Do not cite the frozen ruff PR #4615 (`PrinterFlag` for fix diffs) as the motive or as ty issue 4615.
- Do not split the corpus files from `subscript.rs`, and do not make one group per file.
- Do not describe the reindented `let parameters` block as new logic or as a change to the `Todo`, `Any`, or `Unknown` handling.
- Do not claim the corpus files check the inferred type or that the PR adds an mdtest; they only guard against a panic.
- Do not claim the PR fixes every reproducer in ty issue 4615.

## Notes

The `materialization` detail and the no-panic-only corpus harness are `Good` because they need `types.rs` and `tests/corpus.rs`, which the diff does not touch. The reindent claim is `Must` because rustfmt rewrote the whole block, and a reader who misses the one changed condition misjudges the size of the fix. Past runs often missed the `Divergent` versus `Unknown` split and the legacy and PEP 695 pairing of the corpus files.

`size` allows `trivial` because the code change is one condition. `groups` allows 2 for a review that adds a duplicate or context group, but `together` keeps all three files in one group. No `apart` pairs: the diff has only these three files and they form one concern.
