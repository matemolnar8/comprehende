Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10224076bb04786f64814e07c30f953690fe3fff` and `git rev-parse --verify a7b0036a5bc59bf430bcf9944144f7f8375f2b98` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 10224076bb04786f64814e07c30f953690fe3fff a7b0036a5bc59bf430bcf9944144f7f8375f2b98 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 01 of 01: Stop pruning on close (`keep-until-ttl`)

The what:

The `Pages reviews` workflow drops its `pull_request: closed` trigger and `prune --pr` step, and the index page, `CONTRIBUTING.md`, and two test titles stop promising deletion on close.

Attention (product):
With no close trigger, the daily 04:23 UTC run of `prune --ttl-days 30 --keep presentation` is the only automatic removal, and `matchesPrune` ages a site from its `publishedAt`. So a pull request closed unmerged, or abandoned, also keeps its public review and screenshots on `gh-pages` for up to 30 days after its last publish. Decide whether that is acceptable for every closed pull request, not only merged ones.

Hunk refs for this concern:
- .github/workflows/pages-reviews.yml
- CONTRIBUTING.md
- scripts/pages-review.test.ts
- scripts/pages-review.ts