Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fb5512b5d35ae631ce90b41c889b41320b2e4e71` and `git rev-parse --verify e2c6a91e0ae0ead403f7483a9d8ffed467205ddc` in this repository.
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

base (merge-base)  fb5512b5d35ae631ce90b41c889b41320b2e4e71

head               e2c6a91e0ae0ead403f7483a9d8ffed467205ddc

Named refs at pin: fb5512b5d35ae631ce90b41c889b41320b2e4e71 ... HEAD

Read the diff:

git diff --find-renames fb5512b5d35ae631ce90b41c889b41320b2e4e71 e2c6a91e0ae0ead403f7483a9d8ffed467205ddc

Commits:
- e2c6a91e Skill: a why needs a stated goal, not a named situation

Sources:
- transcript Claude Code session · Nov 7 Máté reported the 0.13.3 eval failure; failing producers said they dropped the why because no user or tool was named.
- commit Skill: a why needs a stated goal, not a named situation

The title:

Keep the why when a source states a goal

The why:

The [0.13.3 eval](source:s1) failed `shadcn-10453` because its review had no why, though the PR states a goal.

The what (trivial):

The why rule asks for who hits the problem and with which tools only when the source names them, and no longer omits the why for mixed sources.

## Review concerns

### 01 Why rule: situation is optional (`mirrors-1`)

`skills-next/comprehende/SKILL.md` changes one line of The why, and the synced copy in `.agents/skills` repeats it, so read the first and skip the copy.

Attention (tradeoff):
The rule drops "or the sources are mixed" and relies on the last sentence about two unrelated stories. A request whose sources disagree on the motive now gets a why from one of them.

[groups/mirrors-1.md](groups/mirrors-1.md)