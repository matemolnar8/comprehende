Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b89c99e380695f042bc07f421e645c651d729635` and `git rev-parse --verify 438555c9acb5628657462b085a322b2a6cc834cd` in this repository.
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

base (merge-base)  b89c99e380695f042bc07f421e645c651d729635

head               438555c9acb5628657462b085a322b2a6cc834cd

Named refs at pin: origin/main ... 438555c9

Read the diff:

git diff --find-renames b89c99e380695f042bc07f421e645c651d729635 438555c9acb5628657462b085a322b2a6cc834cd

Commits:
- 438555c9 Eval: fix help defaults text and contributor suffix check
- 04b122a9 Eval: grade with Ember by default, keep Spark producer
- 7a993392 Eval: pass contributor-mode off for non-contributor models
- ecf9b77f Eval docs: say per 1M tokens on both Ember tiers
- 934c3294 Eval docs: give both Ember price tiers
- ac0648d5 Eval: record why Ember does not replace Spark contributor

Sources:
- pr PR #193 Measured Ember against Spark contributor in both seats; grader switches, producer stays.
  https://github.com/matemolnar8/comprehende/pull/193

The title:

Eval: grade with Ember, keep the Spark producer

The why:

Evals spend the Muse Code subscription by default, so each seat should use the cheapest model that keeps quality on that billing path.

The what (small):

Ember grades eval reviews by default; the producer stays on Spark contributor, and non-contributor models now run on the subscription.

## Review concerns

### 01 Contributor mode per model (`contributor-mode`)

A new contributorMode helper passes contributor mode on only for muse-spark contributor variants and off for other models, so Ember and Wonder run on the subscription instead of failing.

[groups/contributor-mode.md](groups/contributor-mode.md)

### 02 Grader defaults to Ember (`grader-default`)

DEFAULT_GRADER_MODEL becomes muse-ember-1.0 while the producer stays on muse-spark-1.3-contributor, and the args test pins both defaults.

[groups/grader-default.md](groups/grader-default.md)

### 03 Eval docs record the verdict (`eval-docs`)

The docs state the new defaults, the agreement and speed numbers behind the grader switch, and why the producer stays on Spark contributor.

[groups/eval-docs.md](groups/eval-docs.md)