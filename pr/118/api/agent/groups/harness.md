Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify ef1e688be084667a7f76ce365dfbe44bba1f7f55` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ef1e688be084667a7f76ce365dfbe44bba1f7f55 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               ef1e688be084667a7f76ce365dfbe44bba1f7f55

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ef1e688be084667a7f76ce365dfbe44bba1f7f55

Review concern 04 of 05: Harness gates, producer models, and rescore (`harness`)

The why:

The runner has to check the new expects and run the stronger producer [#117](source:s1) needs.

The what:

`checks` gates group count and cross-part `dependsOn`. The runner parses `id:param=value`, names the case work tree, defaults the producer to `grok-4.6:effort=high`, and `--rescore` re-checks saved `review.json` files.

Look for:
- Subtle: `--rescore` clones a fresh work tree, so a producer that left the tree dirty does not fail again.

Depends on:
- 02 Fold outcomes into case.json gates (`expects`)

Hunk refs for this concern:
- scripts/eval/case.ts
- scripts/eval/checks.ts
- scripts/eval/checks.test.ts
- scripts/eval/result.ts
- scripts/eval/report.test.ts
- scripts/eval/graders.test.ts
- scripts/eval/constants.ts
- scripts/eval/args.ts
- scripts/eval/args.test.ts
- scripts/eval/run.ts
- scripts/eval/agent.ts
- scripts/eval/agent.test.ts
- scripts/eval/producer.ts
- scripts/eval/producer.test.ts