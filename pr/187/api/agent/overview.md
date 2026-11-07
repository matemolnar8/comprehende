Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f344a7c5055f503935fbff52c8574fe1233bd93a` and `git rev-parse --verify e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92` in this repository.
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

base (merge-base)  f344a7c5055f503935fbff52c8574fe1233bd93a

head               e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92

Commits:
- e6ae47d8 Skill: keep forge details out; refs from the forge; finish cut fetches
- 032d366a Test: pin the Refresh pointer, not a sentence the skill no longer has
- 85349f21 Skill: check claims outside the diff with git grep; trim and move Refresh
- aee15740 Skill: read every changed file; close the gaps that let unread code pass
- 917cfbde Eval: add vitadeck-144, a case for misses from unread files

Sources:
- transcript Claude Code session · Nov 7 Asks why the limit exists and for a case that catches misses.

The title:

Reviews read every changed file

The why:

Review agents complained about a limit of eight files, and [the requester thinks it hurts review quality](source:s1).

The what (medium):

Reviews now read every changed file, and a new eval case scores the facts unread files hide. Cleanup moves Refresh, trims the skill, and removes every forge name.

Things to check:
- [The request](source:s1) asks for an eval case that catches misses from unread files. `Must` and `Must not` scores do not change the exit code, so `vitadeck-144` shows a miss on its case line and cannot fail CI.

## Review concerns

### 01 Read every changed file (`read-every-file`)

Step 3 now fetches every file that can hold logic, and step 4 keeps what that reading finds. Sources print their size, and a claim outside the diff rests on `git grep`.

Attention (tradeoff):
Step 3 has no limit at any size of change. On `vitadeck-144`, Muse producer tokens rose from about 1.4M to about 5.9M, mostly cached, and generation from about 5.5 to 8.5 minutes. False bullets fell from 14 of 242 to 4 of 243. Decide whether very large changes need a limit.

[groups/read-every-file.md](groups/read-every-file.md)

### 02 Case for unread files (`eval-case`)

`vitadeck-144` scores six facts that only reading a file reveals, on a 110-file feature change.

[groups/eval-case.md](groups/eval-case.md)

### 03 Number bullet verdicts (`grader-numbers`)

The grader keys each bullet verdict by its number, because a count mismatch on this case threw away the whole rubric.

Attention (tradeoff):
`parseRubricReply` throws only on a missing number. A repeated `n` keeps its last verdict, and an `n` past the list is ignored, so a confused reply can still score. The two failed trials returned 125 for 119 and 128 for 122. Decide whether extras should fail.

[groups/grader-numbers.md](groups/grader-numbers.md)

### 04 Read issue lists (`issue-parser`)

`linkedIssueNumbers` reads every number in a list after a closing keyword, which `eval:add` needed for this case.

[groups/issue-parser.md](groups/issue-parser.md)

### 05 Synced skill copies (`synced-copies`)

`pnpm sync:skill` wrote these copies of `skills-next/comprehende`, and the `check:skill` hook checks them, so the reader can skip them.

[groups/synced-copies.md](groups/synced-copies.md)

### 06 Trim the skill and move Refresh (`skill-cleanup`)

Refresh moves behind a pointer, step 4 points at field sections, and `serve` runs in the background. `SKILL.md` goes from 6,562 to 5,746 words.

Attention (contract):
The Refresh pointer used to fire when a review document already existed. It now fires when the user names one, or when this session wrote one. A review from an earlier session that the user does not name starts a fresh review. This review went through the moved steps twice, by hand.

[groups/skill-cleanup.md](groups/skill-cleanup.md)

### 07 Name no forge (`no-forge-details`)

The PR comments rule and the schema description name no forge now, and each agent maps its own forge's fields.

Attention (contract):
The skill no longer says which field holds the current line or thread state. An agent that picks the wrong one writes a wrong pin, or none, and `validate` catches only a line that does not match. A live Opus run found the fields itself. Decide whether that is enough.

[groups/no-forge-details.md](groups/no-forge-details.md)