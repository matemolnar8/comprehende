Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify da6ebeb0cacab7e988d44fe1b22f2cfda32b7747` and `git rev-parse --verify 555733651e4ad59cf6282901f0cc6697402f85ed` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  da6ebeb0cacab7e988d44fe1b22f2cfda32b7747

head               555733651e4ad59cf6282901f0cc6697402f85ed

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 555733651e4ad59cf6282901f0cc6697402f85ed

Commits:
- 5557336 Fix section references in the token efficiency report.
- 285f8f2 Add the token efficiency report.

Sources:
- transcript Cursor session · Sep 21 Investigate token use and time to generate a report while keeping functionality the same; deliver a report with numbers.

The title:

Token efficiency report

The why:

[The session](source:s1) asked for an investigation of how the skill can use fewer tokens and less time to write a review, with numbers behind each proposal, and no change in functionality.

The what (small):

One new document, `docs/token-efficiency.md`, that profiles the producer over the 7 eval cases and proposes file-level hunk refs, a `review` command that prints the covering diff, and a batched skill workflow.

Look for:
- [The session](source:s1) asked for a report, not for code or skill changes. The diff adds one markdown file; `skills-next/`, `src/`, and `scripts/eval/` are untouched.
- Section 2C reports measured numbers from a skill variant that lives outside the repository. The variant is quoted in the appendix; nothing in `skills-next/comprehende/` changed.

## Review concerns

### 01 The report (`report`)

`docs/token-efficiency.md` holds the method, the baseline profile, proposals A to D with measured or estimated savings, the eval harness notes, and the skill variant diff.

[groups/report.md](groups/report.md)