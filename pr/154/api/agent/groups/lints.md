Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify 9a5f8fa9b7438b31aaa738355951e6880d973d42` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 9a5f8fa9b7438b31aaa738355951e6880d973d42 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               9a5f8fa9b7438b31aaa738355951e6880d973d42

Named refs at pin: df67757 ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 9a5f8fa9b7438b31aaa738355951e6880d973d42

Review concern 04 of 05: Summary lints replace the prose grader (`lints`)

The why:

The [brief](source:s1) asked for prose quality to become lints where it can.

The what:

proseLints in scripts/eval/checks.ts counts sentences and path-like tokens in the document summary and each group summary next to the existing dash and sentence-length lints.

Look for:
- A path token is either a slash path or a word of two or more characters with a one-to-five letter extension, so foo.ts and a/b count and e.g does not; more than three in one summary lints. Sentences split on a period, question mark, or exclamation mark followed by a space, so e.g. x counts as two.
- Lints stay advisory: in 133 saved reviews the two new lints fired 19 times.

Hunk refs for this concern:
- scripts/eval/checks.ts
- scripts/eval/checks.test.ts