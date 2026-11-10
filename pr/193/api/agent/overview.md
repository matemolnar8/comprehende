Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b89c99e380695f042bc07f421e645c651d729635` and `git rev-parse --verify 934c329497eba00bddb7b4e8b7e94092e385743b` in this repository.
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

head               934c329497eba00bddb7b4e8b7e94092e385743b

Named refs at pin: origin/main ... 934c3294

Read the diff:

git diff --find-renames b89c99e380695f042bc07f421e645c651d729635 934c329497eba00bddb7b4e8b7e94092e385743b

Commits:
- 934c3294 Eval docs: give both Ember price tiers
- ac0648d5 Eval: record why Ember does not replace Spark contributor

Sources:
- pr PR #193 Measured Ember against Spark contributor and kept the defaults.
  https://github.com/matemolnar8/comprehende/pull/193

The title:

Eval: keep Spark contributor defaults — Ember is not on the subscription and costs more on output

The why:

Evals run on the Muse Code subscription by default, so a cheaper lower-tier model only helps when it runs on that login and costs less per case.

The what (trivial):

One docs paragraph records why Ember stays off the eval defaults.

## Review concerns

### 01 Ember verdict in eval docs (`ember-verdict`)

The paragraph states that Ember has no contributor variant, costs more on output, and fails on the subscription login, so the Spark contributor defaults stay.

[groups/ember-verdict.md](groups/ember-verdict.md)