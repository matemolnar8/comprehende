Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5` and `git rev-parse --verify 8c5594bbc15b7382c254dbd821ad68b5dadafbc0` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5

head               8c5594bbc15b7382c254dbd821ad68b5dadafbc0

Named refs at pin: origin/HEAD ... HEAD

Read the diff:

git diff --find-renames 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5 8c5594bbc15b7382c254dbd821ad68b5dadafbc0

Commits:
- 8c5594b Digest-first review generation
- 841bb77 Eval: read token usage from Muse Code session export

Sources:
- commit Eval: read token usage from Muse Code session export Reports real tokens for musecode producers so efficiency work is measurable.
- commit Digest-first review generation Adds digest, show, and pregroup commands and rewrites the skill around them.
- transcript T3 Code session · Oct 4 The user asked for a radical token-efficiency improvement, then a more step-efficient skill, then this PR.

The title:

Digest-first review generation

The why:

The session asks for a radical cut in review generation tokens [asked](source:s3), and token usage from Muse Code runs makes that cut verifiable [measurable](source:s1).

The what (medium):

Muse Code eval runs report real token usage, and the skill groups reviews from a one-line-per-file digest with patch fetched on demand. Full-suite producer tokens fall from 6.15M to 3.85M.

## Review concerns

### 01 Muse Code token usage (`usage`)

`runMuseCodeAgent` exports the session and sums `model_completed` usage into the run totals, with parser and export tests.

[groups/usage.md](groups/usage.md)

### 02 Digest, show, and pregroup commands (`digest-cli`)

`digest` prints one line per file with kind and hints, `show` prints one hunk or file, and `pregroup` drafts copy, mechanical, and change groups.

[groups/digest-cli.md](groups/digest-cli.md)

### 03 Digest-first skill and docs (`skill`)

The skill batches sources and fetches with a size-scaled allowance, and the README documents the new commands.

Depends on:
- 02 Digest, show, and pregroup commands (`digest-cli`)

[groups/skill.md](groups/skill.md)