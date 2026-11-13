Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10224076bb04786f64814e07c30f953690fe3fff` and `git rev-parse --verify a7b0036a5bc59bf430bcf9944144f7f8375f2b98` in this repository.
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

base (merge-base)  10224076bb04786f64814e07c30f953690fe3fff

head               a7b0036a5bc59bf430bcf9944144f7f8375f2b98

Named refs at pin: origin/main ... origin/t3/keep-hosted-reviews-30-days

Read the diff:

git diff --find-renames 10224076bb04786f64814e07c30f953690fe3fff a7b0036a5bc59bf430bcf9944144f7f8375f2b98

Commits:
- a7b0036a Pages: a merged pull request's review and screenshots stay up for 30 days

Sources:
- pr PR #205
  https://github.com/matemolnar8/comprehende/pull/205

The title:

Pages: a merged pull request's review and screenshots stay up for 30 days

The why:

[PR #205](source:s1) says a closed pull request's hosted review and screenshots were deleted within a minute, breaking the links in merged PR descriptions.

The what (trivial):

Closing a pull request no longer deletes its hosted review; only the 30-day prune does.

## Review concerns

### 01 Stop pruning on close (`keep-until-ttl`)

The `Pages reviews` workflow drops its `pull_request: closed` trigger and `prune --pr` step, and the index page, `CONTRIBUTING.md`, and two test titles stop promising deletion on close.

Attention (product):
With no close trigger, the daily 04:23 UTC run of `prune --ttl-days 30 --keep presentation` is the only automatic removal, and `matchesPrune` ages a site from its `publishedAt`. So a pull request closed unmerged, or abandoned, also keeps its public review and screenshots on `gh-pages` for up to 30 days after its last publish. Decide whether that is acceptable for every closed pull request, not only merged ones.

[groups/keep-until-ttl.md](groups/keep-until-ttl.md)