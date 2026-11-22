Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify e7e5bb1f22cfd022535d1b8a31880f0b045acf64` and `git rev-parse --verify 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames e7e5bb1f22cfd022535d1b8a31880f0b045acf64 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  e7e5bb1f22cfd022535d1b8a31880f0b045acf64

head               4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames e7e5bb1f22cfd022535d1b8a31880f0b045acf64 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d

Review concern 06 of 06: No vendor lock-in rule (`vendor-rule`)

Part: No vendor lock-in

The why:

[PR #209](source:s1) makes the page plain HTML so any harness can show it, and states this as a project rule.

The what:

`AGENTS.md` adds a project rule: build on git, files, and plain HTML, with T3 Code as the one assumed harness.

Attention (product):
The rule bans lock-in to one agent or provider, but names T3 Code as the one harness agents may assume. `page.html` already reads T3 Code theme variables first and falls back to system colors. Decide whether T3 Code is an allowed default or an exception the rule should not name.

Hunk refs for this concern:
- AGENTS.md@61+62